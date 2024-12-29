'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface SearchFormProps {
  initialKeyword?: string;
  placeholder?: string;
}

export default function SearchForm({
  initialKeyword = '',
  placeholder = '검색어를 입력하세요',
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (keyword.trim()) {
      newSearchParams.set('title', keyword);
    } else {
      newSearchParams.delete('title');
    }

    newSearchParams.set('page', '0');
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 w-full max-w-md mx-auto"
    >
      <input
        type="text"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder={placeholder}
        className="input input-bordered flex-1"
      />
      <button
        type="submit"
        className="btn bg-white text-black border-black hover:bg-teal-50 hover:text-teal-500 hover:border-teal-500"
      >
        검색
      </button>
    </form>
  );
}
