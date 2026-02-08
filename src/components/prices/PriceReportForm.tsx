import React, { useState } from 'react';
import { DollarSign, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStorePrices } from '@/hooks/useStorePrices';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPromptModal } from '@/components/LoginPromptModal';

interface PriceReportFormProps {
  storeId: string;
  storeName: string;
}

const COMMON_UNITS = [
  { value: 'each', label: 'Each' },
  { value: 'lb', label: 'Per lb' },
  { value: 'oz', label: 'Per oz' },
  { value: 'gallon', label: 'Per gallon' },
  { value: 'dozen', label: 'Per dozen' },
  { value: 'pack', label: 'Per pack' },
];

export const PriceReportForm: React.FC<PriceReportFormProps> = ({
  storeId,
  storeName,
}) => {
  const { user } = useAuth();
  const { reportPrice } = useStorePrices(storeId);
  const [open, setOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [form, setForm] = useState({
    productName: '',
    price: '',
    unit: 'each',
    isSale: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(form.price);
    if (isNaN(priceValue) || priceValue <= 0) return;
    
    await reportPrice.mutateAsync({
      storeId,
      productName: form.productName.trim(),
      price: priceValue,
      unit: form.unit,
      isSale: form.isSale,
    });
    
    setForm({ productName: '', price: '', unit: 'each', isSale: false });
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !user) {
      setShowLoginPrompt(true);
    } else {
      setOpen(isOpen);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-1" />
            Report Price
            <span className="ml-1 text-xs opacity-70">(+5 pts)</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Report a Price
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Help others by sharing prices at <strong>{storeName}</strong>
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="product">Product Name</Label>
                <Input
                  id="product"
                  placeholder="e.g., Milk, Eggs, Bread"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(value) => setForm({ ...form, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <Label htmlFor="sale" className="cursor-pointer">
                    This is a sale price
                  </Label>
                </div>
                <Switch
                  id="sale"
                  checked={form.isSale}
                  onCheckedChange={(checked) => setForm({ ...form, isSale: checked })}
                />
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Prices expire after 7 days. Other users can verify your reported prices.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!form.productName.trim() || !form.price || reportPrice.isPending}
              >
                {reportPrice.isPending ? 'Submitting...' : 'Submit Price'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action="report prices"
      />
    </>
  );
};
