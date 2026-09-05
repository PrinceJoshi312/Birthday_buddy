import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Person } from '../types';
import { BirthdayCard } from './BirthdayCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';

interface BuddiesScreenProps {
  people: Person[];
  onViewBirthday: (person: Person) => void;
  onDelete: (id: number) => void;
  onOpenAddModal: () => void;
  onSeedSampleData?: () => void;
}

export const BuddiesScreen: React.FC<BuddiesScreenProps> = ({
  people,
  onViewBirthday,
  onDelete,
  onOpenAddModal,
  onSeedSampleData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Friend', 'Best Friend', 'Family', 'Partner', 'Colleague', 'Other'];

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory.toLowerCase() === 'all' ||
      (p.relationship && p.relationship.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Buddies Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-warm-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-soft">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <span>Buddies</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 font-bold">
                {people.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              All your saved birthdays in one place.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold shadow-soft hover:shadow-soft-hover active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add</span>
        </button>
      </div>

      {/* Search & Filter */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        totalResults={filteredPeople.length}
      />

      {/* Complete List of Saved Buddies */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <BirthdayCard
              key={person.id}
              person={person}
              onViewBirthday={onViewBirthday}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          isSearching={Boolean(searchQuery || selectedCategory.toLowerCase() !== 'all')}
          onOpenAddModal={onOpenAddModal}
          onClearSearch={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          onSeedSampleData={people.length === 0 ? onSeedSampleData : undefined}
        />
      )}
    </div>
  );
};
