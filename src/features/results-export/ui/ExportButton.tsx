'use client';

/**
 * Кнопка печати результатов
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Printer } from 'lucide-react';

interface ExportButtonProps {
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  className,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      size="sm"
      title="Печать / PDF"
      className={`no-print ${className || ''}`}
    >
      <Printer className="h-4 w-4 sm:mr-1" />
      <span className="hidden sm:inline">Печать</span>
    </Button>
  );
};
