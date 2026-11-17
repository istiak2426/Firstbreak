import { Language } from '../types/news';

export interface Translations {
  brand: string;
  navClusters: string;
  navLeaderboard: string;
  navTrends: string;
  refreshNews: string;
  refreshing: string;
  sidebarSources: string;
  addSourceToggle: string;
  addSourcePlaceholderName: string;
  addSourcePlaceholderUrl: string;
  addSourceBtn: string;
  storyGrouping: string;
  groupingModeLabel: string;
  groupingExact: string;
  groupingBalanced: string;
  groupingBroad: string;
  groupingHint: string;
  storiesPerSource: string;
  languageLabel: string;
  totalStories: string;
  storyTopics: string;
  multiSourceStories: string;
  fastestOutlet: string;
  searchPlaceholder: string;
  filterAll: string;
  filterMulti: string;
  sortMultiFirst: string;
  sortLatest: string;
  sortBiggestGap: string;
  firstToReport: string;
  sameTime: string;
  laterSuffix: string;
  checkTrend: string;
  hideTrend: string;
  checkingTrend: string;
  sourcesCount: string;
  leadMargin: string;
  openArticle: string;
  noClustersTitle: string;
  noClustersDesc: string;
  resetFilters: string;
  loadingTitle: string;
  loadingDesc: string;
  errorTitle: string;
  retryBtn: string;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  colOutlet: string;
  colArticles: string;
  colShared: string;
  colFirstBreaks: string;
  colAvgDelay: string;
  colBestLead: string;
  trendsTitle: string;
  trendsSubtitle: string;
  analyzeKeywordPlaceholder: string;
  analyzeBtn: string;
  analyzingBtn: string;
  liveTrendsHeading: string;
  groundedAnalysisHeading: string;
  groundedSourcesHeading: string;
  storyCountUnit: string;
  unavailableText: string;
}

export const I18N: Record<Language, Translations> = {
  en: {
    brand: 'FirstBreak',
    navClusters: 'Top Stories',
    navLeaderboard: 'Who Broke First',
    navTrends: 'Trending Now',
    refreshNews: 'Refresh News',
    refreshing: 'Updating...',
    sidebarSources: 'News Sources',
    addSourceToggle: '+ Add another source',
    addSourcePlaceholderName: 'Outlet name (e.g. Dhaka Post)',
    addSourcePlaceholderUrl: 'News feed link (https://...)',
    addSourceBtn: 'Add Source',
    storyGrouping: 'Reading Preferences',
    groupingModeLabel: 'Story Grouping',
    groupingExact: 'Exact',
    groupingBalanced: 'Balanced',
    groupingBroad: 'Broad',
    groupingHint: 'Balanced groups matching headlines across Bangla and English into a single story.',
    storiesPerSource: 'Stories per source',
    languageLabel: 'Language',
    totalStories: 'Headlines Tracked',
    storyTopics: 'Unique Stories',
    multiSourceStories: 'Covered by Multiple Outlets',
    fastestOutlet: 'Fastest Breaking Outlet',
    searchPlaceholder: 'Search headlines or news outlets...',
    filterAll: 'All Stories',
    filterMulti: 'Multi-Outlet Only',
    sortMultiFirst: 'Most Covered First',
    sortLatest: 'Newest First',
    sortBiggestGap: 'Biggest Time Lead',
    firstToReport: 'First to report',
    sameTime: 'Same time',
    laterSuffix: 'later',
    checkTrend: 'Why is this trending?',
    hideTrend: 'Hide summary',
    checkingTrend: 'Checking...',
    sourcesCount: 'outlets',
    leadMargin: 'Time spread',
    openArticle: 'Read full story',
    noClustersTitle: 'No matching stories found',
    noClustersDesc: 'Try switching story grouping to Broad, turning on more news sources, or clearing your search.',
    resetFilters: 'Show All Stories',
    loadingTitle: 'Gathering the latest news',
    loadingDesc: 'Comparing headlines across outlets to see who broke each story first.',
    errorTitle: 'Could not load the latest news',
    retryBtn: 'Try Again',
    leaderboardTitle: 'Outlet Reporting Speed',
    leaderboardSubtitle: 'Compares how quickly each newsroom publishes when multiple outlets cover the same event.',
    colOutlet: 'News Outlet',
    colArticles: 'Stories Tracked',
    colShared: 'Shared Stories',
    colFirstBreaks: 'First to Report',
    colAvgDelay: 'Typical Delay',
    colBestLead: 'Biggest Head Start',
    trendsTitle: 'What People Are Searching For',
    trendsSubtitle: 'See live Google search trends and get a quick briefing on why any topic is in the news.',
    analyzeKeywordPlaceholder: 'Search any topic, person, or headline...',
    analyzeBtn: 'Check Interest',
    analyzingBtn: 'Checking...',
    liveTrendsHeading: 'Trending Searches Right Now',
    groundedAnalysisHeading: 'Story Context',
    groundedSourcesHeading: 'Related Coverage',
    storyCountUnit: 'stories',
    unavailableText: 'Unavailable right now',
  },
  bn: {
    brand: 'FirstBreak',
    navClusters: 'প্রধান খবর',
    navLeaderboard: 'কে সবার আগে',
    navTrends: 'এখন ট্রেন্ডিং',
    refreshNews: 'খবর আপডেট',
    refreshing: 'আপডেট হচ্ছে...',
    sidebarSources: 'সংবাদ মাধ্যমসমূহ',
    addSourceToggle: '+ নতুন মাধ্যম যোগ করুন',
    addSourcePlaceholderName: 'পত্রিকার নাম (যেমন: ঢাকা পোস্ট)',
    addSourcePlaceholderUrl: 'ফিড লিংক (https://...)',
    addSourceBtn: 'যোগ করুন',
    storyGrouping: 'পছন্দসমূহ',
    groupingModeLabel: 'খবর মেলানোর ধরন',
    groupingExact: 'হুবহু',
    groupingBalanced: 'স্বাভাবিক',
    groupingBroad: 'বিস্তৃত',
    groupingHint: 'স্বাভাবিক মোডে বাংলা ও ইংরেজি মাধ্যমের একই বিষয়ের খবরগুলো একসাথে দেখানো হয়।',
    storiesPerSource: 'প্রতি মাধ্যমের খবর',
    languageLabel: 'ভাষা',
    totalStories: 'মোট সংগৃহীত খবর',
    storyTopics: 'মোট বিষয়',
    multiSourceStories: 'একাধিক মাধ্যমে প্রকাশিত',
    fastestOutlet: 'সবার আগে প্রকাশকারী',
    searchPlaceholder: 'খবর বা পত্রিকার নাম খুঁজুন...',
    filterAll: 'সব খবর',
    filterMulti: 'একাধিক মাধ্যম',
    sortMultiFirst: 'একাধিক মাধ্যম আগে',
    sortLatest: 'সর্বশেষ খবর আগে',
    sortBiggestGap: 'সর্বোচ্চ সময়ের ব্যবধান',
    firstToReport: 'সবার আগে প্রকাশ',
    sameTime: 'একই সময়ে',
    laterSuffix: 'পরে',
    checkTrend: 'ট্রেন্ড ও বিস্তারিত জানুন',
    hideTrend: 'বন্ধ করুন',
    checkingTrend: 'যাচাই হচ্ছে...',
    sourcesCount: 'টি মাধ্যম',
    leadMargin: 'সময়ের ব্যবধান',
    openArticle: 'মূল খবর পড়ুন',
    noClustersTitle: 'কোনো খবর পাওয়া যায়নি',
    noClustersDesc: 'খবর মেলানোর ধরন "বিস্তৃত" করে দেখুন অথবা অনুসন্ধান মুছে ফেলুন।',
    resetFilters: 'সব খবর দেখুন',
    loadingTitle: 'সর্বশেষ খবর সংগ্রহ করা হচ্ছে',
    loadingDesc: 'বিভিন্ন সংবাদমাধ্যমের খবর মিলিয়ে দেখা হচ্ছে কোন মাধ্যম সবার আগে প্রকাশ করেছে।',
    errorTitle: 'খবর লোড করতে সমস্যা হয়েছে',
    retryBtn: 'আবার চেষ্টা করুন',
    leaderboardTitle: 'সংবাদমাধ্যমের দ্রুততার তালিকা',
    leaderboardSubtitle: 'একই খবর একাধিক সংবাদমাধ্যমে প্রকাশিত হলে কে কত দ্রুত তা প্রকাশ করেছে তার তুলনা।',
    colOutlet: 'সংবাদমাধ্যম',
    colArticles: 'মোট খবর',
    colShared: 'যৌথ খবর',
    colFirstBreaks: 'সবার আগে প্রকাশ',
    colAvgDelay: 'গড় বিলম্ব',
    colBestLead: 'সর্বোচ্চ লিড',
    trendsTitle: 'মানুষ এখন কী খুঁজছে',
    trendsSubtitle: 'লাইভ গুগল ট্রেন্ডস এবং যেকোনো খবরের বর্তমান জনপ্রিয়তা ও প্রেক্ষাপট দেখুন।',
    analyzeKeywordPlaceholder: 'যেকোনো বিষয়, ব্যক্তি বা খবরের শিরোনাম লিখুন...',
    analyzeBtn: 'জনপ্রিয়তা দেখুন',
    analyzingBtn: 'দেখা হচ্ছে...',
    liveTrendsHeading: 'এই মুহূর্তের ট্রেন্ডিং বিষয়',
    groundedAnalysisHeading: 'সংক্ষিপ্ত প্রেক্ষাপট',
    groundedSourcesHeading: 'সংশ্লিষ্ট সংবাদ সূত্র',
    storyCountUnit: 'টি খবর',
    unavailableText: 'এই মুহূর্তে পাওয়া যাচ্ছে না',
  },
};
