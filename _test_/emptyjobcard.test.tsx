import EmptyJobsCard, { EmptyJobsCardCreative, EmptyJobsCardMinimal } from '@/components/EmptyJobCard';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('EmptyJobsCard components', () => {
  it('renders default EmptyJobsCard with default message and subtitle', () => {
    const { getByText } = render(<EmptyJobsCard />);
    expect(getByText('No jobs scheduled for upcomming days')).toBeTruthy();
    expect(getByText('Take a well-deserved break! 🌟')).toBeTruthy();
    expect(getByText('📋')).toBeTruthy();
  });

  it('renders EmptyJobsCard with custom message and subtitle', () => {
    const { getByText } = render(
      <EmptyJobsCard message="Nothing here!" subtitle="Go grab a coffee ☕" />
    );
    expect(getByText('Nothing here!')).toBeTruthy();
    expect(getByText('Go grab a coffee ☕')).toBeTruthy();
  });

  it('renders default EmptyJobsCardMinimal content', () => {
    const { getByText } = render(<EmptyJobsCardMinimal />);
    expect(getByText('No jobs scheduled for today')).toBeTruthy();
    expect(getByText('Enjoy your free time! ✨')).toBeTruthy();
    expect(getByText('🎯')).toBeTruthy();
  });

  it('renders EmptyJobsCardMinimal with custom props', () => {
    const { getByText } = render(
      <EmptyJobsCardMinimal message="You're off!" subtitle="See you tomorrow 🚀" />
    );
    expect(getByText("You're off!")).toBeTruthy();
    expect(getByText('See you tomorrow 🚀')).toBeTruthy();
  });

  it('renders default EmptyJobsCardCreative content', () => {
    const { getByText } = render(<EmptyJobsCardCreative />);
    expect(getByText('All clear for today!')).toBeTruthy();
    expect(getByText('No scheduled jobs • Time to relax 🌸')).toBeTruthy();
    expect(getByText('🌅')).toBeTruthy();
  });

  it('renders EmptyJobsCardCreative with custom props', () => {
    const { getByText } = render(
      <EmptyJobsCardCreative message="Free as a bird!" subtitle="Chill mode on 🧘" />
    );
    expect(getByText('Free as a bird!')).toBeTruthy();
    expect(getByText('Chill mode on 🧘')).toBeTruthy();
  });
});
