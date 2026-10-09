import { platforms, dayNames } from '@/data/platforms';

const MINUTES_PER_DAY = 1440;
const DAYS = 7;

// Precompute Gaussian LUT for each age group at 1-minute resolution
function buildAgeLUTs(platform) {
  const luts = {};
  for (const ag of platform.ageGroups) {
    const peaks = platform.activityPeaks[ag.id];
    if (!peaks) continue;
    const lut = new Float64Array(MINUTES_PER_DAY);
    for (let m = 0; m < MINUTES_PER_DAY; m++) {
      const h = m / 60;
      let val = 0;
      for (const peak of peaks) {
        const diff = h - peak.h;
        const wrapped = ((diff + 12) % 24) - 12;
        val += peak.w * Math.exp(-(wrapped * wrapped) / (2 * peak.s * peak.s));
      }
      lut[m] = val;
    }
    luts[ag.id] = lut;
  }
  return luts;
}

// Precompute gender factor LUT at 1-minute resolution
function buildGenderLUT(menPct, womenPct) {
  const lut = new Float64Array(MINUTES_PER_DAY);
  const total = menPct + womenPct;
  if (total === 0) {
    lut.fill(1);
    return lut;
  }
  const menW = menPct / total;
  const womenW = womenPct / total;
  for (let m = 0; m < MINUTES_PER_DAY; m++) {
    const h = m / 60;
    const menNight = 1 + 0.08 * (
      Math.exp(-Math.pow(h - 23, 2) / 4) +
      Math.exp(-Math.pow(h - 1, 2) / 4)
    );
    const womenAfternoon = 1 + 0.08 * Math.exp(-Math.pow(h - 15, 2) / 6);
    lut[m] = menW * menNight + womenW * womenAfternoon;
  }
  return lut;
}

// Shared: build 7-day profile + sliding window scores from per-location LUTs
function buildScoresFromLUTs(locLUTs, platform, windowDuration) {
  const windowMins = Math.max(1, Math.round(windowDuration * 60));
  const totalMinutes = DAYS * MINUTES_PER_DAY + windowMins;

  const now = new Date();
  const currentUtcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const currentDay = now.getUTCDay();

  const profile = new Float64Array(totalMinutes);
  for (let m = 0; m < totalMinutes; m++) {
    const utcHour = currentUtcHour + m / 60;
    const dayOffset = Math.floor(utcHour / 24);
    const dayIdx = ((currentDay + dayOffset) % DAYS + DAYS) % DAYS;
    const dayMult = platform.dayMultipliers[dayNames[dayIdx]] || 1;

    let score = 0;
    for (const loc of locLUTs) {
      const localMin = Math.floor((((utcHour + loc.offset) % 24) + 24) % 24 * 60) % MINUTES_PER_DAY;
      score += loc.weight * loc.lut[localMin];
    }
    profile[m] = score * dayMult;
  }

  const scores = new Float64Array(totalMinutes);
  let sum = 0;
  for (let i = 0; i < windowMins && i < totalMinutes; i++) {
    sum += profile[i];
  }
  for (let i = 0; i < totalMinutes; i++) {
    scores[i] = sum / windowMins;
    const addIdx = i + windowMins;
    sum += (addIdx < totalMinutes ? profile[addIdx] : 0) - profile[i];
  }

  return { profile, scores, totalMinutes, windowMins };
}

// Viewer Maximization: all locations share the same age + gender distribution
function computeProfileData(params) {
  const { locations, ageGroups, gender, platformId, windowDuration } = params;
  const platform = params.platformConfig || platforms[platformId];
  if (!platform) return null;

  const validLocs = locations.filter(l => l.offset != null && l.percentage > 0);
  const validAges = ageGroups.filter(a => a.percentage > 0);

  const totalLocW = validLocs.reduce((s, l) => s + l.percentage, 0) || 1;
  const totalAgeW = validAges.reduce((s, a) => s + a.percentage, 0) || 1;
  const menPct = gender?.men || 0;
  const womenPct = gender?.women || 0;

  const ageLUTs = buildAgeLUTs(platform);
  const genderLUT = buildGenderLUT(menPct, womenPct);

  const locLUTs = validLocs.map(loc => {
    const lut = new Float64Array(MINUTES_PER_DAY);
    for (let m = 0; m < MINUTES_PER_DAY; m++) {
      let score = 0;
      if (validAges.length > 0) {
        for (const ag of validAges) {
          score += (ag.percentage / totalAgeW) * (ageLUTs[ag.id]?.[m] || 0);
        }
      } else {
        let sum = 0;
        for (const ag of platform.ageGroups) {
          sum += ageLUTs[ag.id]?.[m] || 0;
        }
        score = sum / platform.ageGroups.length;
      }
      score *= genderLUT[m];
      lut[m] = score;
    }
    return { lut, offset: loc.offset, weight: loc.percentage / totalLocW };
  });

  return buildScoresFromLUTs(locLUTs, platform, windowDuration);
}

// Audience Acquisition: each group has its own location, age group, and gender
function computeProfileDataAcquisition(params) {
  const { groups, platformId, windowDuration } = params;
  const platform = params.platformConfig || platforms[platformId];
  if (!platform) return null;

  const validGroups = groups.filter(g =>
    g.location?.offset != null && g.ageGroupId && parseFloat(g.weight) > 0
  );
  if (validGroups.length === 0) return null;

  const totalWeight = validGroups.reduce((s, g) => s + parseFloat(g.weight), 0) || 1;
  const ageLUTs = buildAgeLUTs(platform);

  const locLUTs = validGroups.map(g => {
    const lut = new Float64Array(MINUTES_PER_DAY);
    const ageLUT = ageLUTs[g.ageGroupId];

    let menPct = 50, womenPct = 50;
    if (g.gender === 'men') { menPct = 100; womenPct = 0; }
    else if (g.gender === 'women') { menPct = 0; womenPct = 100; }
    const genderLUT = buildGenderLUT(menPct, womenPct);

    for (let m = 0; m < MINUTES_PER_DAY; m++) {
      let score = ageLUT ? ageLUT[m] : 0;
      score *= genderLUT[m];
      lut[m] = score;
    }
    return { lut, offset: g.location.offset, weight: parseFloat(g.weight) / totalWeight };
  });

  return buildScoresFromLUTs(locLUTs, platform, windowDuration);
}

// DP-based optimal post selection with per-gap spacing.
function findBestPosts(scores, numPosts, gaps, rangeMins) {
  if (numPosts === 0) return [];
  if (numPosts === 1) {
    let bestT = 0;
    let bestScore = -Infinity;
    for (let t = 0; t < rangeMins; t++) {
      if (scores[t] > bestScore) {
        bestScore = scores[t];
        bestT = t;
      }
    }
    return [bestT];
  }

  const dp = new Array(numPosts);
  const parent = new Array(numPosts);

  dp[0] = new Float64Array(rangeMins);
  parent[0] = new Int32Array(rangeMins).fill(-1);
  for (let t = 0; t < rangeMins; t++) {
    dp[0][t] = scores[t];
  }

  for (let k = 1; k < numPosts; k++) {
    const gapMins = Math.round((gaps[k - 1] || 0) * 60);
    dp[k] = new Float64Array(rangeMins);
    parent[k] = new Int32Array(rangeMins).fill(-1);

    let runningMax = -Infinity;
    let runningMaxIdx = -1;

    for (let t = 0; t < rangeMins; t++) {
      const cutoff = t - gapMins;
      if (cutoff >= 0 && dp[k - 1][cutoff] > runningMax) {
        runningMax = dp[k - 1][cutoff];
        runningMaxIdx = cutoff;
      }
      if (runningMax > -Infinity) {
        dp[k][t] = scores[t] + runningMax;
        parent[k][t] = runningMaxIdx;
      } else {
        dp[k][t] = -Infinity;
      }
    }
  }

  let actualNumPosts = numPosts;
  for (let k = numPosts - 1; k >= 0; k--) {
    let hasValid = false;
    for (let t = 0; t < rangeMins; t++) {
      if (dp[k][t] > -Infinity) { hasValid = true; break; }
    }
    if (hasValid) { actualNumPosts = k + 1; break; }
  }

  let bestT = 0;
  let bestScore = -Infinity;
  for (let t = 0; t < rangeMins; t++) {
    if (dp[actualNumPosts - 1][t] > bestScore) {
      bestScore = dp[actualNumPosts - 1][t];
      bestT = t;
    }
  }

  const times = [];
  let idx = bestT;
  for (let k = actualNumPosts - 1; k >= 0; k--) {
    times.unshift(idx);
    idx = parent[k][idx];
    if (idx < 0 && k > 0) break;
  }

  return times;
}

// Main calculation — computes both daily (next 24h) and weekly (best across entire 7-day period) plans
export function calculatePlans(params) {
  const { numPosts, gaps = [], windowDuration, groups } = params;
  const profileData = groups
    ? computeProfileDataAcquisition(params)
    : computeProfileData(params);
  if (!profileData) return null;

  const { scores, totalMinutes } = profileData;

  const dailyRange = Math.min(MINUTES_PER_DAY, totalMinutes);
  const dailyPostTimes = findBestPosts(scores, numPosts, gaps, dailyRange);

  const weeklyRange = Math.min(DAYS * MINUTES_PER_DAY, totalMinutes);
  const weeklyPostTimes = findBestPosts(scores, numPosts, gaps, weeklyRange);

  let maxScore = 0;
  for (let i = 0; i < weeklyRange; i++) {
    if (scores[i] > maxScore) maxScore = scores[i];
  }
  const normalize = (s) => maxScore > 0 ? Math.round((s / maxScore) * 100) : 0;

  const dailyPosts = dailyPostTimes.map(t => ({
    minuteOffset: t,
    score: scores[t],
    normalizedScore: normalize(scores[t]),
  }));

  const weeklyPosts = weeklyPostTimes.map(t => ({
    minuteOffset: t,
    score: scores[t],
    normalizedScore: normalize(scores[t]),
  }));

  const hourlyData = [];
  for (let h = 0; h < 24; h++) {
    let sum = 0;
    let count = 0;
    for (let m = 0; m < 60; m++) {
      const idx = h * 60 + m;
      if (idx < dailyRange) {
        sum += scores[idx];
        count++;
      }
    }
    const avgScore = count > 0 ? sum / count : 0;
    hourlyData.push({
      hour: h,
      score: normalize(avgScore),
      hasPost: dailyPostTimes.some(t => Math.floor(t / 60) === h),
    });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMs = startOfToday.getTime();
  const nowMs = now.getTime();
  const dayMs = 86400000;

  const dayMaxScores = new Array(7).fill(0);
  for (let m = 0; m < weeklyRange; m++) {
    const localDayIdx = Math.floor((nowMs + m * 60000 - startMs) / dayMs);
    if (localDayIdx >= 0 && localDayIdx < 7 && scores[m] > dayMaxScores[localDayIdx]) {
      dayMaxScores[localDayIdx] = scores[m];
    }
  }

  const dayStrengths = [];
  for (let d = 0; d < 7; d++) {
    dayStrengths.push({
      dayIdx: d,
      dayOfWeek: new Date(startMs + d * dayMs).getDay(),
      strength: normalize(dayMaxScores[d]),
      hasPost: false,
    });
  }

  for (const post of weeklyPosts) {
    const localDayIdx = Math.floor((nowMs + post.minuteOffset * 60000 - startMs) / dayMs);
    if (localDayIdx >= 0 && localDayIdx < 7) {
      dayStrengths[localDayIdx].hasPost = true;
    }
  }

  return {
    daily: { posts: dailyPosts, hourlyData },
    weekly: { posts: weeklyPosts, dayStrengths },
  };
}