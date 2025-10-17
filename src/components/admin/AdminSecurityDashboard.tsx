import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { GoogleDataPreservation } from "./GoogleDataPreservation";

/**
 * Admin-only security dashboard showing current security posture
 */
export const AdminSecurityDashboard = () => {
  return (
    <div className="space-y-6">
      <GoogleDataPreservation />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>
            Overview of implemented security measures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Privacy Protection Active</AlertTitle>
            <AlertDescription>
              User locations truncated to ~100m precision, 90-day auto-deletion enabled
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Row-Level Security</AlertTitle>
            <AlertDescription>
              All sensitive tables protected with RLS policies
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Email Privacy</AlertTitle>
            <AlertDescription>
              Public profiles view excludes email addresses
            </AlertDescription>
          </Alert>

          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Edge Function Security</AlertTitle>
            <AlertDescription>
              Admin-only operations require authentication and role verification
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Manual Configuration Required</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Complete these security steps in Supabase dashboard:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Enable leaked password protection in Auth settings</li>
                <li>Upgrade PostgreSQL to latest version</li>
                <li>Set up scheduled cleanup job for store_clicks (90-day retention)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
