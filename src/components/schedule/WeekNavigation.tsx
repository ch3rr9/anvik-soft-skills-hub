
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WeekNavigationProps } from "@/types/schedule-types";

const WeekNavigation = ({ currentWeek, onWeekChange }: WeekNavigationProps) => {
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    onWeekChange(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    onWeekChange(nextWeek);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
    startOfWeek.setDate(today.getDate() - diff);
    onWeekChange(startOfWeek);
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
    startOfCurrentWeek.setDate(today.getDate() - diff);
    
    return currentWeek.toDateString() === startOfCurrentWeek.toDateString();
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium min-w-[200px] text-center">
          {formatWeekRange(currentWeek)}
        </h2>
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {!isCurrentWeek() && (
        <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
          Текущая неделя
        </Button>
      )}
    </div>
  );
};

export default WeekNavigation;
