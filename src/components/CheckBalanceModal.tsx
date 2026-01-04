import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Phone, CreditCard } from 'lucide-react';

// State EBT balance check resources
const stateEbtResources: Record<string, { name: string; phone: string; website: string }> = {
  AL: { name: 'Alabama', phone: '1-800-997-8888', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  AK: { name: 'Alaska', phone: '1-888-622-7328', website: 'https://www.ebt.acs-inc.com/ebtedge' },
  AZ: { name: 'Arizona', phone: '1-888-997-9333', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  AR: { name: 'Arkansas', phone: '1-800-997-9999', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  CA: { name: 'California', phone: '1-877-328-9677', website: 'https://www.ebt.ca.gov/' },
  CO: { name: 'Colorado', phone: '1-888-328-2656', website: 'https://www.coloradopeak.secure.force.com/' },
  CT: { name: 'Connecticut', phone: '1-888-328-2666', website: 'https://www.connect.ct.gov/' },
  DE: { name: 'Delaware', phone: '1-800-526-9099', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  DC: { name: 'District of Columbia', phone: '1-800-537-5219', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  FL: { name: 'Florida', phone: '1-888-356-3281', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  GA: { name: 'Georgia', phone: '1-888-421-3281', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  HI: { name: 'Hawaii', phone: '1-888-328-4292', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  ID: { name: 'Idaho', phone: '1-800-997-7777', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  IL: { name: 'Illinois', phone: '1-800-678-4328', website: 'https://abe.illinois.gov/' },
  IN: { name: 'Indiana', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  IA: { name: 'Iowa', phone: '1-800-359-5802', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  KS: { name: 'Kansas', phone: '1-800-997-6666', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  KY: { name: 'Kentucky', phone: '1-888-979-9949', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  LA: { name: 'Louisiana', phone: '1-888-524-3328', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  ME: { name: 'Maine', phone: '1-800-477-7428', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MD: { name: 'Maryland', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MA: { name: 'Massachusetts', phone: '1-800-997-2555', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MI: { name: 'Michigan', phone: '1-888-678-8914', website: 'https://www.michigan.gov/mibridges' },
  MN: { name: 'Minnesota', phone: '1-888-997-2227', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MS: { name: 'Mississippi', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MO: { name: 'Missouri', phone: '1-800-997-7777', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  MT: { name: 'Montana', phone: '1-800-997-7777', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NE: { name: 'Nebraska', phone: '1-800-383-8555', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NV: { name: 'Nevada', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NH: { name: 'New Hampshire', phone: '1-888-997-2227', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NJ: { name: 'New Jersey', phone: '1-800-997-3333', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NM: { name: 'New Mexico', phone: '1-800-997-4444', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  NY: { name: 'New York', phone: '1-888-328-6399', website: 'https://www.connectebt.com/' },
  NC: { name: 'North Carolina', phone: '1-888-622-7328', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  ND: { name: 'North Dakota', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  OH: { name: 'Ohio', phone: '1-866-386-3071', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  OK: { name: 'Oklahoma', phone: '1-888-328-4328', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  OR: { name: 'Oregon', phone: '1-855-328-6715', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  PA: { name: 'Pennsylvania', phone: '1-888-328-7366', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  RI: { name: 'Rhode Island', phone: '1-888-979-9911', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  SC: { name: 'South Carolina', phone: '1-888-997-7777', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  SD: { name: 'South Dakota', phone: '1-800-997-2222', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  TN: { name: 'Tennessee', phone: '1-888-997-9444', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  TX: { name: 'Texas', phone: '1-800-777-7328', website: 'https://www.texasbenefits.com/' },
  UT: { name: 'Utah', phone: '1-800-997-4444', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  VT: { name: 'Vermont', phone: '1-800-997-2555', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  VA: { name: 'Virginia', phone: '1-866-281-2448', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  WA: { name: 'Washington', phone: '1-888-328-9281', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  WV: { name: 'West Virginia', phone: '1-866-545-6502', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  WI: { name: 'Wisconsin', phone: '1-800-997-2227', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
  WY: { name: 'Wyoming', phone: '1-800-997-4444', website: 'https://www.ebtedge.com/gov/portal/PortalHome.do' },
};

interface CheckBalanceModalProps {
  trigger?: React.ReactNode;
}

export const CheckBalanceModal = ({ trigger }: CheckBalanceModalProps) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [open, setOpen] = useState(false);

  const selectedResource = selectedState ? stateEbtResources[selectedState] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Check Balance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Check Your EBT Balance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Select your state to find the official resources for checking your EBT card balance.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your State</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(stateEbtResources)
                  .sort((a, b) => a[1].name.localeCompare(b[1].name))
                  .map(([code, { name }]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedResource && (
            <div className="space-y-3 pt-2 animate-in fade-in-50 slide-in-from-top-2">
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <h4 className="font-medium text-sm">{selectedResource.name} EBT Resources</h4>
                
                <a 
                  href={`tel:${selectedResource.phone}`}
                  className="flex items-center gap-3 p-3 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Call Balance Hotline</p>
                    <p className="text-sm text-muted-foreground">{selectedResource.phone}</p>
                  </div>
                </a>

                <a 
                  href={selectedResource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Check Balance Online</p>
                    <p className="text-sm text-muted-foreground">Visit official portal</p>
                  </div>
                </a>
              </div>

              <p className="text-xs text-muted-foreground">
                You'll need your EBT card number and PIN to check your balance.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
