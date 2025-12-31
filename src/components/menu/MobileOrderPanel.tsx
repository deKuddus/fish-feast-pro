import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { OrderTypeToggle } from './OrderTypeToggle';

interface MobileOrderPanelProps {
  orderType: 'delivery' | 'pickup';
  onOrderTypeChange: (type: 'delivery' | 'pickup') => void;
}

export function MobileOrderPanel({ orderType, onOrderTypeChange }: MobileOrderPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="xl:hidden">
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Order Options</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <OrderTypeToggle value={orderType} onChange={onOrderTypeChange} />
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive font-medium">⚠️ Delivery currently unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">Please check back later or select another service method</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
