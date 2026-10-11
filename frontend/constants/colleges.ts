export const COLLEGES = [
  'Integral University',
  'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
  'Budge Budge Institute of Technology (BBIT)',
  'Faculty of Medicine, Qena, Egypt',
  'Jadavpur University',
  'University of Calcutta',
  'Heritage Institute of Technology (HIT)',
  'Institute of Engineering and Management (IEM)',
  'Techno India University',
  'Netaji Subhash Engineering College (NSEC)',
  'Meghnad Saha Institute of Technology (MSIT)',
  'RCC Institute of Information Technology (RCCIIT)',
  'Narula Institute of Technology (NiT)',
  'Guru Nanak Institute of Technology (GNIT)',
  'MCKV Institute of Engineering',
  'B.P. Poddar Institute of Management and Technology (BPPIMT)',
  'St. Thomas\' College of Engineering and Technology (STCET)',
  'St. Xavier\'s College, Kolkata',
  'Presidency University, Kolkata',
  'Bethune College',
  'Scottish Church College',
  'Loreto College',
  'Asutosh College',
  'Goenka College of Commerce and Business Administration',
  'Lady Brabourne College',
  'Sister Nivedita University (SNU)',
  'Amity University, Kolkata',
  'Adamas University',
  'Brainware University',
  'The Neotia University',
  'JIS College of Engineering',
  'Aliah University',
  'Maulana Abul Kalam Azad University of Technology (MAKAUT)',
  'Government College of Engineering and Leather Technology (GCELT)',
  'Bengal Institute of Technology',
  'Pailan College of Management and Technology',
  'Calcutta Institute of Technology',
  'Regent Education and Research Foundation',
  'IIT Bombay',
  'IIT Delhi',
  'IIT Kanpur',
  'IIT Madras',
  'NIT Trichy',
  'University of Delhi',
  'Anna University',
  'Other'
];

export const getCollegeSlug = (college: string): string => {
  if (!college || college === 'All Colleges') return '/all-campuses';
  if (college === 'Integral University') return '/integral-university';
  if (college.includes('Abdul Kalam') || college.includes('AKTU')) {
    return '/dr-apj-abdul-kalam-technical-university-aktu';
  }
  const clean = college
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/${clean}`;
};

export default COLLEGES;