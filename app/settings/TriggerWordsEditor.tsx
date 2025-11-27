import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { splitSmart } from "app/gallery/metadataParser";
import React, { useEffect, useState } from "react";
import type { ExtraDataType, TriggerWord } from "server/types";
import { useModels, useTriggerWords } from "../stores";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";

const TriggerWordsEditor: React.FC = () => {
  const { triggerWords, addTriggerWord, updateTriggerWord, deleteTriggerWord } =
    useTriggerWords();
  const { models, fetchModels } = useModels();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<TriggerWord | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleAdd = () => {
    setNewEntry({
      type: "embedding",
      target: "",
      words: [],
    });
  };

  const handleSaveNew = () => {
    if (newEntry && newEntry.target && newEntry.words.length > 0) {
      addTriggerWord(newEntry);
      setNewEntry(null);
    }
  };

  const handleCancelNew = () => {
    setNewEntry(null);
  };

  const handleDelete = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = () => {
    if (deleteConfirmIndex !== null) {
      deleteTriggerWord(deleteConfirmIndex);
      setDeleteConfirmIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number, updated: TriggerWord) => {
    updateTriggerWord(index, updated);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const getAvailableTargets = (type: ExtraDataType) => {
    const targets = type === "embedding" ? models.embeddings : models.loras;
    return targets.map((t) => t.replace(".safetensors", ""));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Trigger Words</Label>
        <Button
          onClick={handleAdd}
          variant="secondary"
          size="sm"
          disabled={newEntry !== null}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* New Entry Form */}
      {newEntry && (
        <Card className="border-primary bg-surface-hover p-4">
          <TriggerWordForm
            entry={newEntry}
            onChange={setNewEntry}
            availableTargets={getAvailableTargets(newEntry.type)}
            onSave={handleSaveNew}
            onCancel={handleCancelNew}
          />
        </Card>
      )}

      {/* Existing Entries */}
      <div className="space-y-2">
        {triggerWords.map((entry, index) => (
          <Card key={index} className="border-border bg-surface p-4">
            {editingIndex === index ? (
              <TriggerWordForm
                entry={entry}
                onChange={(updated) => {
                  // Update in place for editing
                  updateTriggerWord(index, updated);
                }}
                availableTargets={getAvailableTargets(entry.type)}
                onSave={() => handleSaveEdit(index, entry)}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col items-stretch justify-center">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            entry.type === "embedding"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {entry.type === "lora" ? "LoRA" : "Embedding"}
                        </span>
                        <span className="text-xs">{entry.target}</span>
                      </div>
                    </div>
                    <div className="ml-2 flex gap-1">
                      <Button
                        onClick={() => handleEdit(index)}
                        variant="secondary"
                        size="sm"
                        className="h-8 w-10"
                      >
                        <PencilIcon className="h-8 w-8" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(index)}
                        variant="danger"
                        size="sm"
                        className="h-8 w-10"
                      >
                        <TrashIcon className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.words.map((word, wordIndex) => (
                      <span
                        key={wordIndex}
                        className="rounded border border-border bg-surface-hover px-2 py-1 text-xs"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {triggerWords.length === 0 && !newEntry && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No trigger words configured. Click "Add Entry" to create one.
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-sm border-border bg-surface shadow-2xl">
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Delete Trigger Word?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete the trigger word for{" "}
                  <span className="font-medium text-white">
                    {triggerWords[deleteConfirmIndex]?.target}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={cancelDelete} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button onClick={confirmDelete} variant="danger" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface TriggerWordFormProps {
  entry: TriggerWord;
  onChange: (entry: TriggerWord) => void;
  availableTargets: string[];
  onSave: () => void;
  onCancel: () => void;
}

const TriggerWordForm: React.FC<TriggerWordFormProps> = ({
  entry,
  onChange,
  availableTargets,
  onSave,
  onCancel,
}) => {
  const [wordInput, setWordInput] = useState("");

  const handleAddWord = () => {
    const newWords = splitSmart(wordInput);
    if (newWords.length > 0) {
      onChange({
        ...entry,
        words: [...entry.words, ...newWords],
      });
      setWordInput("");
    }
  };

  const handleRemoveWord = (index: number) => {
    onChange({
      ...entry,
      words: entry.words.filter((_, i) => i !== index),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 text-xs">Type</Label>
          <Select
            value={entry.type}
            onChange={(e) =>
              onChange({
                ...entry,
                type: e.target.value as ExtraDataType,
                target: "", // Reset target when type changes
              })
            }
          >
            <option value="embedding">Embedding</option>
            <option value="lora">LoRA</option>
          </Select>
        </div>
        <div>
          <Label className="mb-1 text-xs">Target</Label>
          <Select
            value={entry.target}
            onChange={(e) =>
              onChange({
                ...entry,
                target: e.target.value,
              })
            }
          >
            <option value="">Select {entry.type}...</option>
            {availableTargets.map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1 text-xs">Words</Label>
        <div className="mb-2 flex gap-2">
          <Input
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a word..."
            className="flex-1"
          />
          <Button onClick={handleAddWord} variant="secondary" size="sm">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {entry.words.map((word, index) => (
            <span
              key={index}
              className="flex items-center gap-1 rounded border border-border bg-surface-hover px-2 py-1 text-xs"
            >
              {word}
              <button
                onClick={() => handleRemoveWord(index)}
                className="hover:text-red-400"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onCancel} variant="ghost" size="sm">
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="primary"
          size="sm"
          disabled={!entry.target || entry.words.length === 0}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default TriggerWordsEditor;
