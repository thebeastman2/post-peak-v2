import { Calendar, CalendarDays } from 'lucide-react';
import DailyGraph from './DailyGraph';
import WeeklyDayStrength from './WeeklyDayStrength';
import PostCard from './PostCard';
import TiltCard from '@/components/effects/TiltCard';
import Reveal from '@/components/effects/Reveal';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ResultsPanel({ results }) {
  if (!results) return null;
  const { daily, weekly } = results;
  const now = new Date();

  const dailyCards = daily.posts.map((post, i) => {
    const postTime = new Date(now.getTime() + post.minuteOffset * 60000);
    const hh = String(postTime.getHours()).padStart(2, '0');
    const mm = String(postTime.getMinutes()).padStart(2, '0');
    const hoursFromNow = Math.round(post.minuteOffset / 60);
    return {
      index: i + 1,
      time: `${hh}:${mm}`,
      label: `in ${hoursFromNow}h`,
      reachScore: post.normalizedScore,
    };
  });

  const weeklyCards = weekly.posts.map((post, i) => {
    const postTime = new Date(now.getTime() + post.minuteOffset * 60000);
    const hh = String(postTime.getHours()).padStart(2, '0');
    const mm = String(postTime.getMinutes()).padStart(2, '0');
    return {
      index: i + 1,
      time: `${hh}:${mm}`,
      label: DAY_LABELS[postTime.getDay()],
      reachScore: post.normalizedScore,
    };
  });

  return (
    <div className="space-y-5">
      <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Recommended Plans</h2>

      <Reveal>
        <TiltCard className="p-5">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 pp-text-muted" />
              <h3 className="text-sm font-medium pp-text">Today</h3>
              <span className="ml-auto text-xs pp-text-muted">Next 24 hours</span>
            </div>
            <p className="text-xs pp-text-muted leading-relaxed">
              Best times to post starting now. Gaps are the actual spacing achieved — your minimums may be exceeded to hit higher peaks.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dailyCards.map(card => (
                <PostCard key={card.index} {...card} />
              ))}
            </div>
            <DailyGraph hourlyData={daily.hourlyData} />
          </div>
        </TiltCard>
      </Reveal>

      <Reveal delay={0.12}>
        <TiltCard className="p-5">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 pp-text-muted" />
              <h3 className="text-sm font-medium pp-text">This Week</h3>
              <span className="ml-auto text-xs pp-text-muted">7-day schedule</span>
            </div>
            <p className="text-xs pp-text-muted leading-relaxed">
              Best posts spread across the week. Minimum gaps set a floor — posts may space further apart to land on higher-reach slots.
            </p>
            <WeeklyDayStrength dayStrengths={weekly.dayStrengths} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {weeklyCards.map(card => (
                <PostCard key={card.index} {...card} />
              ))}
            </div>
          </div>
        </TiltCard>
      </Reveal>
    </div>
  );
}