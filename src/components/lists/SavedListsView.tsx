import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Trash2, MapPin, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSavedLists, useListStores } from '@/hooks/useSavedLists';

export const SavedListsView: React.FC = () => {
  const { lists, isLoading, createList, deleteList } = useSavedLists();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newList, setNewList] = useState({ name: '', description: '' });

  const handleCreate = async () => {
    if (!newList.name.trim()) return;
    await createList.mutateAsync({
      name: newList.name.trim(),
      description: newList.description.trim() || undefined,
    });
    setNewList({ name: '', description: '' });
    setShowCreateDialog(false);
  };

  const handleDelete = async () => {
    if (deleteListId) {
      await deleteList.mutateAsync(deleteListId);
      setDeleteListId(null);
      if (selectedListId === deleteListId) {
        setSelectedListId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Lists</h2>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Button>
      </div>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">No lists yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom lists to organize your favorite stores
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedListId(list.id)}
            >
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{list.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {list.store_count} {list.store_count === 1 ? 'store' : 'stores'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteListId(list.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List Detail View */}
      {selectedListId && (
        <ListDetailView
          listId={selectedListId}
          listName={lists.find((l) => l.id === selectedListId)?.name || ''}
          onBack={() => setSelectedListId(null)}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Weekend Shopping"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this list for?"
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newList.name.trim()}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteListId} onOpenChange={() => setDeleteListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All stores will be removed from this list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Sub-component for viewing list contents
const ListDetailView: React.FC<{
  listId: string;
  listName: string;
  onBack: () => void;
}> = ({ listId, listName, onBack }) => {
  const { data: stores = [], isLoading } = useListStores(listId);
  const { removeFromList } = useSavedLists();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={onBack}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{listName}</DialogTitle>
        </DialogHeader>
        
        {stores.length === 0 ? (
          <div className="py-8 text-center">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No stores in this list yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((item: any) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-3 rounded-lg border"
              >
                <Link to={`/store/${item.store_id}`} className="flex-1">
                  <h4 className="font-medium hover:text-primary">
                    {item.snap_stores?.Store_Name || 'Unknown Store'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.snap_stores?.City}, {item.snap_stores?.State}
                  </p>
                  {item.snap_stores?.google_rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{item.snap_stores.google_rating}</span>
                    </div>
                  )}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromList.mutate({ listId, storeId: item.store_id })}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
