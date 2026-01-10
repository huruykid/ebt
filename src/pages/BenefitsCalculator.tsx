import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, AlertTriangle, CheckCircle2, XCircle, ExternalLink, ArrowLeft, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SEOHead } from '@/components/SEOHead';
import { 
  calculateEstimatedBenefit, 
  STATE_APPLICATION_LINKS,
  SNAP_FY_YEAR,
  SNAP_EFFECTIVE_DATE,
  SNAP_END_DATE
} from '@/constants/snapBenefitsData';

const US_STATES = Object.entries(STATE_APPLICATION_LINKS).map(([code, { name }]) => ({
  code,
  name,
})).sort((a, b) => a.name.localeCompare(b.name));

export default function BenefitsCalculator() {
  const [state, setState] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [grossIncome, setGrossIncome] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateEstimatedBenefit> | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const size = parseInt(householdSize, 10);
    const income = parseFloat(grossIncome.replace(/[^0-9.]/g, ''));

    if (isNaN(size) || size < 1 || isNaN(income) || income < 0) {
      return;
    }

    const calculationResult = calculateEstimatedBenefit(size, income);
    setResult(calculationResult);
    setShowResult(true);
  };

  const handleReset = () => {
    setState('');
    setHouseholdSize('');
    setGrossIncome('');
    setResult(null);
    setShowResult(false);
  };

  const isFormValid = state && householdSize && grossIncome && parseFloat(grossIncome) >= 0;

  return (
    <>
      <SEOHead
        title="SNAP Benefits Calculator | Estimate Your EBT Food Assistance"
        description="Free SNAP benefits calculator. Estimate your EBT food stamp eligibility and monthly benefit amount based on your household size and income."
        keywords="SNAP calculator, EBT benefits calculator, food stamps eligibility, SNAP eligibility, food assistance calculator"
        canonicalUrl="https://ebtfinder.org/benefits-calculator"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">SNAP Benefits Calculator</h1>
                <p className="text-muted-foreground">Estimate your food assistance eligibility</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Disclaimer */}
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> This calculator provides an <strong>estimate only</strong>. 
              Actual SNAP eligibility and benefit amounts are determined by your state agency and may differ 
              based on deductions, assets, and other factors not captured here. 
              Data is based on FY{SNAP_FY_YEAR} guidelines ({SNAP_EFFECTIVE_DATE} - {SNAP_END_DATE}).
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Your Benefits
                </CardTitle>
                <CardDescription>
                  Enter your information below for an estimate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(({ code, name }) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Household Size */}
                <div className="space-y-2">
                  <Label htmlFor="household">Household Size</Label>
                  <Select value={householdSize} onValueChange={setHouseholdSize}>
                    <SelectTrigger id="household">
                      <SelectValue placeholder="Number of people" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                      <SelectItem value="9">9+ people</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Include everyone who lives and eats together
                  </p>
                </div>

                {/* Gross Monthly Income */}
                <div className="space-y-2">
                  <Label htmlFor="income">Gross Monthly Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="income"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={grossIncome}
                      onChange={(e) => setGrossIncome(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total household income before taxes and deductions
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleCalculate} 
                    disabled={!isFormValid}
                    className="flex-1"
                  >
                    Calculate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              {showResult && result && (
                <Card className={result.isEligible ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
                  <CardHeader className={result.isEligible ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}>
                    <CardTitle className="flex items-center gap-2">
                      {result.isEligible ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-green-700 dark:text-green-400">You May Be Eligible!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-700 dark:text-red-400">May Not Qualify</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {result.isEligible ? (
                      <>
                        <div className="text-center py-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Benefit</p>
                          <p className="text-4xl font-bold text-green-600">
                            ${result.estimatedBenefit.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Maximum possible: ${result.maxBenefit}/month
                          </p>
                        </div>

                        {state && STATE_APPLICATION_LINKS[state] && (
                          <Button asChild className="w-full" size="lg">
                            <a 
                              href={STATE_APPLICATION_LINKS[state].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Apply in {STATE_APPLICATION_LINKS[state].name}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {result.reason}
                        </p>
                        <div className="text-sm space-y-1">
                          <p><strong>Gross income limit:</strong> ${result.grossIncomeLimit.toLocaleString()}/month</p>
                          <p><strong>Net income limit:</strong> ${result.netIncomeLimit.toLocaleString()}/month</p>
                        </div>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Your actual eligibility may differ. Many states have expanded eligibility 
                            or special programs. We recommend applying anyway or contacting your local office.
                          </AlertDescription>
                        </Alert>
                        {state && STATE_APPLICATION_LINKS[state] && (
                          <Button asChild variant="outline" className="w-full">
                            <a 
                              href={STATE_APPLICATION_LINKS[state].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Check with {STATE_APPLICATION_LINKS[state].name}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Privacy Notice */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Your Privacy is Protected</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        All calculations happen in your browser. We do not collect, store, or transmit 
                        any of your personal or financial information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              {!showResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How SNAP Benefits Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>SNAP</strong> (Supplemental Nutrition Assistance Program) helps 
                      low-income households buy nutritious food through an EBT card.
                    </p>
                    <p>
                      <strong>Eligibility</strong> is based on your household size, income, 
                      and certain expenses like rent and childcare.
                    </p>
                    <p>
                      <strong>Benefits</strong> are calculated by subtracting 30% of your 
                      net income from the maximum allotment for your household size.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Find Stores CTA */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Already have EBT?</h3>
                  <p className="text-muted-foreground">
                    Find stores near you that accept SNAP benefits.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/">Find EBT Stores Near Me</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
