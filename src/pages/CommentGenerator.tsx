
import { CommentGenerator } from "@/components/CommentGenerator";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CommentGeneratorPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background">
        <CommentGenerator />
      </div>
    </ProtectedRoute>
  );
}
