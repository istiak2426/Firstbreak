import { Language } from '../types/news';

export interface Translations {
  brand: string;
  navClusters: string;
  navLeaderboard: string;
  refreshNews: string;
  refreshing: string;
  heroTitle: string;
  heroSubtitle: string;
  sidebarSources: string;
  moreSettings: string;
  hideSettings: string;
  addSourceToggle: string;
  addSourcePlaceholderName: string;
  addSourcePlaceholderUrl: string;
  addSourceBtn: string;
  cancelBtn: string;
  formRequiredError: string;
  formProtocolError: string;
  formInvalidUrlError: string;
  groupingModeLabel: string;
  groupingExact: string;
  groupingBalanced: string;
  groupingBroad: string;
  storiesPerSource: string;
  languageLabel: string;
  statCompared: string;
  statComparedSub: string;
  statFastest: string;
  statFastestSub: string;
  statSources: string;
  statSourcesSub: string;
  searchPlaceholder: string;
  filterCompared: string;
  filterAll: string;
  sortMultiFirst: string;
  sortLatest: string;
  sortBiggestGap: string;
  rankFirst: string;
  rankNthSuffix: string;
  firstToReport: string;
  sameTime: string;
  laterSuffix: string;
  singleOutletNote: string;
  minuteShort: string;
  hourShort: string;
  sourcesCount: string;
  publishedFirstBy: string;
  openArticle: string;
  noClustersTitle: string;
  noClustersDesc: string;
  showAllBtn: string;
  loadingTitle: string;
  loadingDesc: string;
  errorTitle: string;
  retryBtn: string;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  leaderboardEmpty: string;
  colOutlet: string;
  colFirstBreaks: string;
  colShared: string;
  colAvgDelay: string;
  colBestLead: string;
  timesUnit: string;
  unavailableText: string;
}

export const I18N: Record<Language, Translations> = {
  bn: {
    brand: 'FirstBreak',
    navClusters: 'কে আগে খবর দিল',
    navLeaderboard: 'দ্রুততার তালিকা',
    refreshNews: 'নতুন খবর আনুন',
    refreshing: 'খোঁজা হচ্ছে...',
    heroTitle: 'একই খবর কোন পত্রিকা সবার আগে দিয়েছে?',
    heroSubtitle:
      'এখানে প্রথম আলো, ডেইলি স্টার, বিবিসি বাংলাসহ বিভিন্ন পত্রিকার খবর মিলিয়ে দেখানো হয় কোন মাধ্যম খবরটি প্রথম প্রকাশ করেছে এবং অন্যরা কত মিনিট পরে দিয়েছে।',
    sidebarSources: 'পত্রিকা বাছাই করুন',
    moreSettings: 'আরও সেটিংস',
    hideSettings: 'সেটিংস লুকান',
    addSourceToggle: '+ নিজের পছন্দের পত্রিকার লিংক যোগ করুন',
    addSourcePlaceholderName: 'পত্রিকার নাম',
    addSourcePlaceholderUrl: 'ওয়েবসাইট ফিড লিংক (https://...)',
    addSourceBtn: 'যোগ করুন',
    cancelBtn: 'বাতিল',
    formRequiredError: 'পত্রিকার নাম ও লিংক দুটিই দিন।',
    formProtocolError: 'লিংকটি http:// বা https:// দিয়ে শুরু হতে হবে।',
    formInvalidUrlError: 'সঠিক ওয়েব লিংক দিন।',
    groupingModeLabel: 'খবর মেলানোর ধরন',
    groupingExact: 'হুবহু এক',
    groupingBalanced: 'স্বাভাবিক',
    groupingBroad: 'কাছাকাছি সব',
    storiesPerSource: 'প্রতি পত্রিকার খবর সংখ্যা',
    languageLabel: 'ভাষা',
    statCompared: 'একই খবরের তুলনা',
    statComparedSub: 'একাধিক পত্রিকায় পাওয়া গেছে',
    statFastest: 'সবার আগে দিয়েছে',
    statFastestSub: 'সবচেয়ে বেশিবার প্রথম হয়েছে',
    statSources: 'সক্রিয় পত্রিকা',
    statSourcesSub: 'টি মাধ্যম থেকে সংগ্রহ',
    searchPlaceholder: 'যেকোনো খবর বা পত্রিকার নাম লিখে খুঁজুন...',
    filterCompared: 'তুলনাযোগ্য খবর (২+ পত্রিকা)',
    filterAll: 'সব খবর দেখুন',
    sortMultiFirst: 'একাধিক পত্রিকার খবর আগে',
    sortLatest: 'সর্বশেষ খবর আগে',
    sortBiggestGap: 'সময়ের ব্যবধান বেশি আগে',
    rankFirst: '১ম',
    rankNthSuffix: 'য়',
    firstToReport: 'সবার আগে প্রকাশ',
    sameTime: 'একই সময়ে',
    laterSuffix: 'পরে',
    singleOutletNote: 'এখন পর্যন্ত শুধু এই পত্রিকায় পাওয়া গেছে',
    minuteShort: 'মিনিট',
    hourShort: 'ঘণ্টা',
    sourcesCount: 'টি পত্রিকা দিয়েছে',
    publishedFirstBy: 'প্রথম দিয়েছে:',
    openArticle: 'খবরটি পড়ুন',
    noClustersTitle: 'এই মুহূর্তে কোনো মিল থাকা খবর পাওয়া যায়নি',
    noClustersDesc:
      'সবগুলো খবর দেখতে "সব খবর দেখুন" চাপুন অথবা বাম পাশ থেকে আরও পত্রিকা চালু করুন।',
    showAllBtn: 'সব খবর দেখুন',
    loadingTitle: 'পত্রিকাগুলো থেকে সর্বশেষ খবর আনা হচ্ছে...',
    loadingDesc: 'একই বিষয়ের খবরগুলো একসাথে মিলিয়ে কে আগে দিয়েছে তা সাজানো হচ্ছে।',
    errorTitle: 'খবর আনা সম্ভব হয়নি',
    retryBtn: 'আবার চেষ্টা করুন',
    leaderboardTitle: 'কোন পত্রিকা কত দ্রুত খবর দেয়',
    leaderboardSubtitle:
      'একাধিক পত্রিকায় প্রকাশিত একই খবরগুলোর মধ্যে কোন পত্রিকা কতবার সবার আগে প্রকাশ করেছে তার হিসাব।',
    leaderboardEmpty: 'তালিকা দেখতে প্রথমে "নতুন খবর আনুন" বাটনে চাপুন।',
    colOutlet: 'সংবাদ মাধ্যম',
    colFirstBreaks: 'সবার আগে দিয়েছে',
    colShared: 'মোট যৌথ খবর',
    colAvgDelay: 'গড় দেরি',
    colBestLead: 'সর্বোচ্চ এগিয়ে ছিল',
    timesUnit: 'বার',
    unavailableText: 'পাওয়া যাচ্ছে না',
  },
  en: {
    brand: 'FirstBreak',
    navClusters: 'Who Broke First',
    navLeaderboard: 'Speed Ranking',
    refreshNews: 'Refresh News',
    refreshing: 'Checking...',
    heroTitle: 'Which news outlet published the story first?',
    heroSubtitle:
      'We match the same news story across Prothom Alo, The Daily Star, BBC Bangla, and other outlets to show who broke it first and how many minutes later others followed.',
    sidebarSources: 'News Outlets',
    moreSettings: 'More Settings',
    hideSettings: 'Hide Settings',
    addSourceToggle: '+ Add custom news source',
    addSourcePlaceholderName: 'Outlet name',
    addSourcePlaceholderUrl: 'Feed URL (https://...)',
    addSourceBtn: 'Add',
    cancelBtn: 'Cancel',
    formRequiredError: 'Please enter both name and link.',
    formProtocolError: 'Link must start with http:// or https://',
    formInvalidUrlError: 'Please enter a valid web link.',
    groupingModeLabel: 'Story Matching',
    groupingExact: 'Strict',
    groupingBalanced: 'Balanced',
    groupingBroad: 'Broad',
    storiesPerSource: 'Stories per outlet',
    languageLabel: 'Language',
    statCompared: 'Compared Stories',
    statComparedSub: 'Covered by 2 or more outlets',
    statFastest: 'Fastest Outlet',
    statFastestSub: 'Most first-to-publish wins',
    statSources: 'Active Outlets',
    statSourcesSub: 'sources currently checked',
    searchPlaceholder: 'Search by topic or outlet name...',
    filterCompared: 'Compared Stories (2+ outlets)',
    filterAll: 'All Stories',
    sortMultiFirst: 'Compared Stories First',
    sortLatest: 'Newest First',
    sortBiggestGap: 'Largest Time Gap',
    rankFirst: '1st',
    rankNthSuffix: '',
    firstToReport: 'First to publish',
    sameTime: 'Same minute',
    laterSuffix: 'later',
    singleOutletNote: 'Only found on this outlet so far',
    minuteShort: 'min',
    hourShort: 'hr',
    sourcesCount: 'outlets covered',
    publishedFirstBy: 'First by:',
    openArticle: 'Read story',
    noClustersTitle: 'No matching multi-outlet stories found right now',
    noClustersDesc:
      'Click "All Stories" to view every headline, or enable more news outlets on the left.',
    showAllBtn: 'Show All Stories',
    loadingTitle: 'Fetching the latest headlines...',
    loadingDesc: 'Matching related stories across outlets and comparing publish times.',
    errorTitle: 'Could not load news',
    retryBtn: 'Try Again',
    leaderboardTitle: 'Outlet Reporting Speed',
    leaderboardSubtitle:
      'Shows how often each outlet published first when multiple outlets covered the same event.',
    leaderboardEmpty: 'Click Refresh News to compare outlet speed.',
    colOutlet: 'News Outlet',
    colFirstBreaks: 'Published First',
    colShared: 'Shared Stories',
    colAvgDelay: 'Avg Delay',
    colBestLead: 'Biggest Lead',
    timesUnit: 'times',
    unavailableText: 'Unavailable',
  },
};
