import React from 'react';
import { BookOpen } from 'lucide-react';
import Button from '../../common/Button';

export default function Toolbar({
  onReferenceClick,
  hasReference = false,
  className = ''
}) {
  if (!hasReference) return null;

  return (
    <div className={`flex items-center gap-2 p-3 bg-white border-b border-gray-200 ${className}`}>
      <Button variant="outline" size="sm" onClick={onReferenceClick}>
        <BookOpen className="w-4 h-4 mr-2" />
        Reference
      </Button>
    </div>
  );
}
