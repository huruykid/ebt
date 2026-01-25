import React, { useState } from 'react';
import { Plus, FolderPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavedLists, useListStores } from '@/hooks/useSavedLists';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPromptModal } from '@/components/LoginPromptModal';

interface AddToListButtonProps {
  storeId: string;
  storeName: string;
  variant?: 'icon' | 'button';
}

export const AddToListButton: React.FC<AddToListButtonProps> = ({
  storeId,
  storeName,
  variant = 'icon',
}) => {
  const { user } = useAuth();
  const { lists, createList, addToList } = useSavedLists();
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToList = async (listId: string) => {
    setIsAdding(true);
    try {
      await addToList.mutateAsync({ listId, storeId });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) return;
    
    setIsAdding(true);
    try {
      const newList = await createList.mutateAsync({ name: newListName.trim() });
      await addToList.mutateAsync({ listId: newList.id, storeId });
      setNewListName('');
      setShowNewListDialog(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    }
  };

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size={variant === 'icon' ? 'icon' : 'sm'}
          onClick={handleClick}
          className="text-muted-foreground hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          {variant === 'button' && <span className="ml-1">Add to List</span>}
        </Button>
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          action="save stores to lists"
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={variant === 'icon' ? 'icon' : 'sm'}
            className="text-muted-foreground hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            {variant === 'button' && <span className="ml-1">Add to List</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {lists.length > 0 && (
            <>
              {lists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={isAdding}
                >
                  <span className="truncate">{list.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {list.store_count}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowNewListDialog(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Create New List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="listName">List Name</Label>
              <Input
                id="listName"
                placeholder="e.g., Weekend Shopping, Best Deals"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              "{storeName}" will be added to this list.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAndAdd} disabled={!newListName.trim() || isAdding}>
              {isAdding ? 'Creating...' : 'Create & Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
