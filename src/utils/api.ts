import type { Language } from '../types/news';

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  lang: Language = 'bn'
): Promise<T> {
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    if (lang === 'bn') {
      throw new Error(
        res.ok
          ? 'সার্ভার থেকে সঠিক ফরম্যাটে তথ্য পাওয়া যায়নি।'
          : `সার্ভারের সাথে সংযোগ করা যায়নি (${res.status})। কিছুক্ষণ পর আবার চেষ্টা করুন।`
      );
    }
    throw new Error(
      res.ok
        ? 'Unexpected response format from server.'
        : `Server unavailable (${res.status}). Please try again.`
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      lang === 'bn'
        ? 'সার্ভারের তথ্য পড়তে সমস্যা হয়েছে।'
        : 'Unable to parse server response.'
    );
  }

  if (!res.ok) {
    const errMsg =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : lang === 'bn'
          ? `সার্ভার ত্রুটি (${res.status})`
          : `Server error (${res.status})`;
    throw new Error(errMsg);
  }

  return data as T;
}
