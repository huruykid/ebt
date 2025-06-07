
import ExploreTrending from "@/components/ExploreTrending";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Index() {
  return (
    <ProtectedRoute>
      <ExploreTrending />
    </ProtectedRoute>
  );
}
