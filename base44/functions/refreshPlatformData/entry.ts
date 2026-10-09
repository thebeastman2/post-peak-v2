
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const platformId = body?.platform_id;
    if (!platformId) return Response.json({ error: 'Missing platform_id' }, { status: 400 });

    const platformMeta = {
      instagram: { name: 'Instagram', label: 'Instagram Reels', ageGroups: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
      tiktok: { name: 'TikTok', label: 'TikTok Videos', ageGroups: ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'] },
      snapchat: { name: 'Snapchat', label: 'Snapchat Spotlight', ageGroups: ['13-17', '18-24', '25-34', '35-44', '45+'] },
      youtube: { name: 'YouTube', label: 'YouTube Shorts', ageGroups: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
      facebook: { name: 'Facebook', label: 'Facebook Reels', ageGroups: ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
    };
    const meta = platformMeta[platformId];
    if (!meta) return Response.json({ error: 'Unknown platform' }, { status: 400 });

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are a social media analytics expert. Based on CURRENT ${today} usage trends for ${meta.name} (${meta.label}), return audience activity as JSON.

Age group ids — use these EXACT strings as "ageGroup" (note the "+" character in ids like "65+"): ${JSON.stringify(meta.ageGroups)}.

For each age group give 1-3 activity peaks: "hour" (0-23, decimals ok) and "intensity" (0.3-1.5).
Also give "dayMultipliers" (0.8-1.2) for monday-sunday.

Keep it concise. Return only JSON matching the schema.`;

    const schema = {
      type: 'object',
      properties: {
        activity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ageGroup: { type: 'string' },
              peaks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    hour: { type: 'number' },
                    intensity: { type: 'number' },
                  },
                  required: ['hour', 'intensity'],
                },
              },
            },
            required: ['ageGroup', 'peaks'],
          },
        },
        dayMultipliers: {
          type: 'object',
          properties: {
            monday: { type: 'number' },
            tuesday: { type: 'number' },
            wednesday: { type: 'number' },
            thursday: { type: 'number' },
            friday: { type: 'number' },
            saturday: { type: 'number' },
            sunday: { type: 'number' },
          },
        },
      },
      required: ['activity', 'dayMultipliers'],
    };

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: schema,
    });

    const activityPeaks = {};
    const activity = llmRes?.activity;
    if (Array.isArray(activity)) {
      for (const ag of activity) {
        if (!ag || !ag.ageGroup || !Array.isArray(ag.peaks)) continue;
        activityPeaks[ag.ageGroup] = ag.peaks
          .filter(p => p && typeof p.hour === 'number')
          .map(p => ({
            h: p.hour,
            w: typeof p.intensity === 'number' ? p.intensity : 1,
            s: 2.5,
          }));
      }
    }
    const dayMultipliers = llmRes?.dayMultipliers || {};

    const payload = {
      platform_id: platformId,
      activity_peaks: JSON.stringify(activityPeaks),
      day_multipliers: JSON.stringify(dayMultipliers),
      source_note: `AI-sourced ${today} via live web research`,
    };

    const existing = await base44.asServiceRole.entities.PlatformData.filter(
      { platform_id: platformId },
      '-created_date',
      1
    );
    let record;
    if (existing && existing.length > 0) {
      record = await base44.asServiceRole.entities.PlatformData.update(existing[0].id, payload);
    } else {
      record = await base44.asServiceRole.entities.PlatformData.create(payload);
    }

    return Response.json({
      platform_id: platformId,
      activityPeaks,
      dayMultipliers,
      updated_date: record?.created_date || new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});