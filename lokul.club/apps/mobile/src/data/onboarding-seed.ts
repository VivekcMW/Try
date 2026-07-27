// Seed data for v1 onboarding. Real impl will hit /api/societies, /api/postal, etc.
import {
  Baby,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Car,
  ChefHat,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  Key,
  Leaf,
  Music,
  Newspaper,
  Plane,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Tag,
  UserRound,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface Society {
  id: string;
  name: string;
  city: string;
  pin: string;
  towers: string[];
}

export const SOCIETIES: Society[] = [
  {
    id: 'soc-1',
    name: 'Kumar Sienna',
    city: 'Pune',
    pin: '411014',
    towers: ['A', 'B', 'C', 'D'],
  },
  {
    id: 'soc-2',
    name: 'Amanora Park Town',
    city: 'Pune',
    pin: '411028',
    towers: ['Future', 'Trendy', 'Adriana', 'Aspire'],
  },
  {
    id: 'soc-3',
    name: 'Magarpatta Daffodils',
    city: 'Pune',
    pin: '411028',
    towers: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'soc-4',
    name: 'Lodha Belmondo',
    city: 'Pune',
    pin: '411033',
    towers: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 'soc-5',
    name: 'Godrej Infinity',
    city: 'Pune',
    pin: '411014',
    towers: ['Tower 1', 'Tower 2', 'Tower 3'],
  },
  {
    id: 'soc-6',
    name: 'Nyati Equatorial',
    city: 'Pune',
    pin: '411028',
    towers: ['A', 'B'],
  },
  {
    id: 'soc-7',
    name: 'Blue Ridge Township',
    city: 'Pune',
    pin: '411057',
    towers: ['Allura', 'Bellatrix', 'Cassiopeia', 'Draco'],
  },
];

// Stub for PIN -> city lookup covering major Indian cities across all states.
// Real impl: useQuery against postal-codes table.
const PIN_TO_CITY: Record<string, string> = {
  // ── MAHARASHTRA ──────────────────────────────────────────────────────────
  // Pune
  '411001': 'Pune', '411002': 'Pune', '411003': 'Pune', '411004': 'Pune',
  '411005': 'Pune', '411006': 'Pune', '411007': 'Pune', '411008': 'Pune',
  '411009': 'Pune', '411011': 'Pune', '411012': 'Pune', '411013': 'Pune',
  '411014': 'Pune', '411015': 'Pune', '411016': 'Pune', '411017': 'Pune',
  '411018': 'Pune', '411019': 'Pune', '411020': 'Pune', '411021': 'Pune',
  '411022': 'Pune', '411023': 'Pune', '411024': 'Pune', '411025': 'Pune',
  '411026': 'Pune', '411027': 'Pune', '411028': 'Pune', '411029': 'Pune',
  '411030': 'Pune', '411031': 'Pune', '411032': 'Pune', '411033': 'Pune',
  '411034': 'Pune', '411035': 'Pune', '411036': 'Pune', '411037': 'Pune',
  '411038': 'Pune', '411039': 'Pune', '411040': 'Pune', '411041': 'Pune',
  '411042': 'Pune', '411043': 'Pune', '411044': 'Pune', '411045': 'Pune',
  '411046': 'Pune', '411047': 'Pune', '411048': 'Pune', '411051': 'Pune',
  '411052': 'Pune', '411057': 'Pune', '411058': 'Pune', '411060': 'Pune',
  '411061': 'Pune', '411062': 'Pune', '411068': 'Pune',
  // Mumbai
  '400001': 'Mumbai', '400002': 'Mumbai', '400003': 'Mumbai', '400004': 'Mumbai',
  '400005': 'Mumbai', '400006': 'Mumbai', '400007': 'Mumbai', '400008': 'Mumbai',
  '400009': 'Mumbai', '400010': 'Mumbai', '400011': 'Mumbai', '400012': 'Mumbai',
  '400013': 'Mumbai', '400014': 'Mumbai', '400015': 'Mumbai', '400016': 'Mumbai',
  '400017': 'Mumbai', '400018': 'Mumbai', '400019': 'Mumbai', '400020': 'Mumbai',
  '400021': 'Mumbai', '400022': 'Mumbai', '400023': 'Mumbai', '400024': 'Mumbai',
  '400025': 'Mumbai', '400026': 'Mumbai', '400027': 'Mumbai', '400028': 'Mumbai',
  '400029': 'Mumbai', '400030': 'Mumbai', '400031': 'Mumbai', '400032': 'Mumbai',
  '400033': 'Mumbai', '400034': 'Mumbai', '400035': 'Mumbai', '400036': 'Mumbai',
  '400037': 'Mumbai', '400038': 'Mumbai', '400039': 'Mumbai', '400040': 'Mumbai',
  '400041': 'Mumbai', '400042': 'Mumbai', '400043': 'Mumbai', '400044': 'Mumbai',
  '400045': 'Mumbai', '400046': 'Mumbai', '400047': 'Mumbai', '400048': 'Mumbai',
  '400049': 'Mumbai', '400050': 'Mumbai', '400051': 'Mumbai', '400052': 'Mumbai',
  '400053': 'Mumbai', '400054': 'Mumbai', '400055': 'Mumbai', '400056': 'Mumbai',
  '400057': 'Mumbai', '400058': 'Mumbai', '400059': 'Mumbai', '400060': 'Mumbai',
  '400061': 'Mumbai', '400062': 'Mumbai', '400063': 'Mumbai', '400064': 'Mumbai',
  '400065': 'Mumbai', '400066': 'Mumbai', '400067': 'Mumbai', '400068': 'Mumbai',
  '400069': 'Mumbai', '400070': 'Mumbai', '400071': 'Mumbai', '400072': 'Mumbai',
  '400073': 'Mumbai', '400074': 'Mumbai', '400075': 'Mumbai', '400076': 'Mumbai',
  '400077': 'Mumbai', '400078': 'Mumbai', '400079': 'Mumbai', '400080': 'Mumbai',
  '400081': 'Mumbai', '400082': 'Mumbai', '400083': 'Mumbai', '400084': 'Mumbai',
  '400085': 'Mumbai', '400086': 'Mumbai', '400087': 'Mumbai', '400088': 'Mumbai',
  '400089': 'Mumbai', '400090': 'Mumbai', '400091': 'Mumbai', '400092': 'Mumbai',
  '400093': 'Mumbai', '400094': 'Mumbai', '400095': 'Mumbai', '400096': 'Mumbai',
  '400097': 'Mumbai', '400098': 'Mumbai', '400099': 'Mumbai', '400100': 'Mumbai',
  '400101': 'Mumbai', '400102': 'Mumbai', '400103': 'Mumbai', '400104': 'Mumbai',
  '400105': 'Mumbai', '400106': 'Mumbai', '400107': 'Mumbai',
  // Navi Mumbai
  '400701': 'Navi Mumbai', '400703': 'Navi Mumbai', '400704': 'Navi Mumbai',
  '400705': 'Navi Mumbai', '400706': 'Navi Mumbai', '400707': 'Navi Mumbai',
  '400708': 'Navi Mumbai', '400709': 'Navi Mumbai', '400710': 'Navi Mumbai',
  // Thane
  '400601': 'Thane', '400602': 'Thane', '400603': 'Thane', '400604': 'Thane',
  '400605': 'Thane', '400606': 'Thane', '400607': 'Thane', '400608': 'Thane',
  '400609': 'Thane', '400610': 'Thane',
  // Nagpur
  '440001': 'Nagpur', '440002': 'Nagpur', '440003': 'Nagpur', '440004': 'Nagpur',
  '440005': 'Nagpur', '440006': 'Nagpur', '440007': 'Nagpur', '440008': 'Nagpur',
  '440009': 'Nagpur', '440010': 'Nagpur', '440012': 'Nagpur', '440013': 'Nagpur',
  '440014': 'Nagpur', '440015': 'Nagpur', '440016': 'Nagpur', '440017': 'Nagpur',
  '440018': 'Nagpur', '440019': 'Nagpur', '440020': 'Nagpur', '440021': 'Nagpur',
  '440022': 'Nagpur', '440023': 'Nagpur', '440024': 'Nagpur', '440025': 'Nagpur',
  '440026': 'Nagpur', '440027': 'Nagpur', '440028': 'Nagpur', '440029': 'Nagpur',
  '440030': 'Nagpur', '440031': 'Nagpur', '440032': 'Nagpur', '440033': 'Nagpur',
  '440034': 'Nagpur', '440035': 'Nagpur',
  // Nashik
  '422001': 'Nashik', '422002': 'Nashik', '422003': 'Nashik', '422004': 'Nashik',
  '422005': 'Nashik', '422006': 'Nashik', '422007': 'Nashik', '422008': 'Nashik',
  '422009': 'Nashik', '422010': 'Nashik', '422011': 'Nashik', '422012': 'Nashik',
  '422013': 'Nashik',
  // Aurangabad (Chhatrapati Sambhajinagar)
  '431001': 'Aurangabad', '431002': 'Aurangabad', '431003': 'Aurangabad',
  '431004': 'Aurangabad', '431005': 'Aurangabad', '431006': 'Aurangabad',
  '431007': 'Aurangabad', '431008': 'Aurangabad', '431009': 'Aurangabad',
  // Solapur
  '413001': 'Solapur', '413002': 'Solapur', '413003': 'Solapur', '413004': 'Solapur',
  '413005': 'Solapur', '413006': 'Solapur', '413007': 'Solapur',
  // Kolhapur
  '416001': 'Kolhapur', '416002': 'Kolhapur', '416003': 'Kolhapur', '416004': 'Kolhapur',
  '416005': 'Kolhapur', '416006': 'Kolhapur', '416007': 'Kolhapur', '416008': 'Kolhapur',
  '416009': 'Kolhapur', '416010': 'Kolhapur', '416011': 'Kolhapur', '416012': 'Kolhapur',
  // Amravati
  '444601': 'Amravati', '444602': 'Amravati', '444603': 'Amravati',
  '444604': 'Amravati', '444605': 'Amravati', '444606': 'Amravati',
  // Latur
  '413512': 'Latur', '413513': 'Latur', '413514': 'Latur', '413515': 'Latur',
  // Jalgaon
  '425001': 'Jalgaon', '425002': 'Jalgaon', '425003': 'Jalgaon',
  // Dhule
  '424001': 'Dhule', '424002': 'Dhule', '424003': 'Dhule',

  // ── DELHI / NCR ───────────────────────────────────────────────────────────
  // New Delhi / Delhi
  '110001': 'New Delhi', '110002': 'New Delhi', '110003': 'New Delhi', '110004': 'New Delhi',
  '110005': 'New Delhi', '110006': 'New Delhi', '110007': 'New Delhi', '110008': 'New Delhi',
  '110009': 'New Delhi', '110010': 'New Delhi', '110011': 'New Delhi', '110012': 'New Delhi',
  '110013': 'New Delhi', '110014': 'New Delhi', '110015': 'New Delhi', '110016': 'New Delhi',
  '110017': 'New Delhi', '110018': 'New Delhi', '110019': 'New Delhi', '110020': 'New Delhi',
  '110021': 'New Delhi', '110022': 'New Delhi', '110023': 'New Delhi', '110024': 'New Delhi',
  '110025': 'New Delhi', '110026': 'New Delhi', '110027': 'New Delhi', '110028': 'New Delhi',
  '110029': 'New Delhi', '110030': 'New Delhi', '110031': 'New Delhi', '110032': 'New Delhi',
  '110033': 'New Delhi', '110034': 'New Delhi', '110035': 'New Delhi', '110036': 'New Delhi',
  '110037': 'New Delhi', '110038': 'New Delhi', '110039': 'New Delhi', '110040': 'New Delhi',
  '110041': 'New Delhi', '110042': 'New Delhi', '110043': 'New Delhi', '110044': 'New Delhi',
  '110045': 'New Delhi', '110046': 'New Delhi', '110047': 'New Delhi', '110048': 'New Delhi',
  '110049': 'New Delhi', '110051': 'New Delhi', '110052': 'New Delhi', '110053': 'New Delhi',
  '110054': 'New Delhi', '110055': 'New Delhi', '110056': 'New Delhi', '110057': 'New Delhi',
  '110058': 'New Delhi', '110059': 'New Delhi', '110060': 'New Delhi', '110061': 'New Delhi',
  '110062': 'New Delhi', '110063': 'New Delhi', '110064': 'New Delhi', '110065': 'New Delhi',
  '110066': 'New Delhi', '110067': 'New Delhi', '110068': 'New Delhi', '110069': 'New Delhi',
  '110070': 'New Delhi', '110071': 'New Delhi', '110072': 'New Delhi', '110073': 'New Delhi',
  '110074': 'New Delhi', '110075': 'New Delhi', '110076': 'New Delhi', '110077': 'New Delhi',
  '110078': 'New Delhi', '110081': 'New Delhi', '110082': 'New Delhi', '110083': 'New Delhi',
  '110084': 'New Delhi', '110085': 'New Delhi', '110086': 'New Delhi', '110087': 'New Delhi',
  '110088': 'New Delhi', '110089': 'New Delhi', '110090': 'New Delhi', '110091': 'New Delhi',
  '110092': 'New Delhi', '110093': 'New Delhi', '110094': 'New Delhi', '110095': 'New Delhi',
  '110096': 'New Delhi', '110097': 'New Delhi',
  // Noida
  '201301': 'Noida', '201302': 'Noida', '201303': 'Noida', '201304': 'Noida',
  '201305': 'Noida', '201306': 'Noida', '201307': 'Noida', '201308': 'Noida',
  '201309': 'Noida', '201310': 'Noida', '201311': 'Noida', '201313': 'Noida',
  '201314': 'Noida', '201315': 'Noida', '201316': 'Noida', '201317': 'Noida',
  '201318': 'Noida',
  // Gurugram
  '122001': 'Gurugram', '122002': 'Gurugram', '122003': 'Gurugram', '122004': 'Gurugram',
  '122006': 'Gurugram', '122007': 'Gurugram', '122008': 'Gurugram', '122009': 'Gurugram',
  '122010': 'Gurugram', '122011': 'Gurugram', '122015': 'Gurugram', '122016': 'Gurugram',
  '122017': 'Gurugram', '122018': 'Gurugram', '122022': 'Gurugram', '122051': 'Gurugram',
  '122052': 'Gurugram', '122101': 'Gurugram', '122102': 'Gurugram', '122103': 'Gurugram',
  // Faridabad
  '121001': 'Faridabad', '121002': 'Faridabad', '121003': 'Faridabad', '121004': 'Faridabad',
  '121005': 'Faridabad', '121006': 'Faridabad', '121007': 'Faridabad', '121008': 'Faridabad',
  '121009': 'Faridabad', '121010': 'Faridabad',
  // Ghaziabad
  '201001': 'Ghaziabad', '201002': 'Ghaziabad', '201003': 'Ghaziabad', '201004': 'Ghaziabad',
  '201005': 'Ghaziabad', '201006': 'Ghaziabad', '201009': 'Ghaziabad', '201010': 'Ghaziabad',
  '201011': 'Ghaziabad', '201012': 'Ghaziabad', '201013': 'Ghaziabad', '201014': 'Ghaziabad',
  // Chandigarh
  '160001': 'Chandigarh', '160002': 'Chandigarh', '160003': 'Chandigarh', '160004': 'Chandigarh',
  '160009': 'Chandigarh', '160010': 'Chandigarh', '160011': 'Chandigarh', '160012': 'Chandigarh',
  '160014': 'Chandigarh', '160015': 'Chandigarh', '160016': 'Chandigarh', '160017': 'Chandigarh',
  '160018': 'Chandigarh', '160019': 'Chandigarh', '160020': 'Chandigarh', '160022': 'Chandigarh',
  '160036': 'Chandigarh', '160047': 'Chandigarh', '160055': 'Chandigarh', '160101': 'Chandigarh',

  // ── KARNATAKA ─────────────────────────────────────────────────────────────
  // Bengaluru
  '560001': 'Bengaluru', '560002': 'Bengaluru', '560003': 'Bengaluru', '560004': 'Bengaluru',
  '560005': 'Bengaluru', '560006': 'Bengaluru', '560007': 'Bengaluru', '560008': 'Bengaluru',
  '560009': 'Bengaluru', '560010': 'Bengaluru', '560011': 'Bengaluru', '560012': 'Bengaluru',
  '560013': 'Bengaluru', '560014': 'Bengaluru', '560015': 'Bengaluru', '560016': 'Bengaluru',
  '560017': 'Bengaluru', '560018': 'Bengaluru', '560019': 'Bengaluru', '560020': 'Bengaluru',
  '560021': 'Bengaluru', '560022': 'Bengaluru', '560023': 'Bengaluru', '560024': 'Bengaluru',
  '560025': 'Bengaluru', '560026': 'Bengaluru', '560027': 'Bengaluru', '560028': 'Bengaluru',
  '560029': 'Bengaluru', '560030': 'Bengaluru', '560032': 'Bengaluru', '560033': 'Bengaluru',
  '560034': 'Bengaluru', '560035': 'Bengaluru', '560036': 'Bengaluru', '560037': 'Bengaluru',
  '560038': 'Bengaluru', '560039': 'Bengaluru', '560040': 'Bengaluru', '560041': 'Bengaluru',
  '560042': 'Bengaluru', '560043': 'Bengaluru', '560044': 'Bengaluru', '560045': 'Bengaluru',
  '560046': 'Bengaluru', '560047': 'Bengaluru', '560048': 'Bengaluru', '560049': 'Bengaluru',
  '560050': 'Bengaluru', '560051': 'Bengaluru', '560052': 'Bengaluru', '560053': 'Bengaluru',
  '560054': 'Bengaluru', '560055': 'Bengaluru', '560056': 'Bengaluru', '560057': 'Bengaluru',
  '560058': 'Bengaluru', '560059': 'Bengaluru', '560060': 'Bengaluru', '560061': 'Bengaluru',
  '560062': 'Bengaluru', '560063': 'Bengaluru', '560064': 'Bengaluru', '560065': 'Bengaluru',
  '560066': 'Bengaluru', '560067': 'Bengaluru', '560068': 'Bengaluru', '560069': 'Bengaluru',
  '560070': 'Bengaluru', '560071': 'Bengaluru', '560072': 'Bengaluru', '560073': 'Bengaluru',
  '560074': 'Bengaluru', '560075': 'Bengaluru', '560076': 'Bengaluru', '560077': 'Bengaluru',
  '560078': 'Bengaluru', '560079': 'Bengaluru', '560080': 'Bengaluru', '560081': 'Bengaluru',
  '560082': 'Bengaluru', '560083': 'Bengaluru', '560084': 'Bengaluru', '560085': 'Bengaluru',
  '560086': 'Bengaluru', '560087': 'Bengaluru', '560088': 'Bengaluru', '560089': 'Bengaluru',
  '560090': 'Bengaluru', '560091': 'Bengaluru', '560092': 'Bengaluru', '560093': 'Bengaluru',
  '560094': 'Bengaluru', '560095': 'Bengaluru', '560096': 'Bengaluru', '560097': 'Bengaluru',
  '560098': 'Bengaluru', '560099': 'Bengaluru', '560100': 'Bengaluru',
  // Mysuru
  '570001': 'Mysuru', '570002': 'Mysuru', '570003': 'Mysuru', '570004': 'Mysuru',
  '570005': 'Mysuru', '570006': 'Mysuru', '570007': 'Mysuru', '570008': 'Mysuru',
  '570009': 'Mysuru', '570010': 'Mysuru', '570011': 'Mysuru', '570012': 'Mysuru',
  '570014': 'Mysuru', '570015': 'Mysuru', '570016': 'Mysuru', '570017': 'Mysuru',
  '570018': 'Mysuru', '570019': 'Mysuru', '570020': 'Mysuru', '570023': 'Mysuru',
  '570024': 'Mysuru', '570025': 'Mysuru', '570026': 'Mysuru', '570028': 'Mysuru',
  '570029': 'Mysuru', '570030': 'Mysuru',
  // Mangaluru
  '575001': 'Mangaluru', '575002': 'Mangaluru', '575003': 'Mangaluru', '575004': 'Mangaluru',
  '575005': 'Mangaluru', '575006': 'Mangaluru', '575007': 'Mangaluru', '575008': 'Mangaluru',
  '575009': 'Mangaluru', '575010': 'Mangaluru', '575011': 'Mangaluru', '575013': 'Mangaluru',
  '575014': 'Mangaluru', '575015': 'Mangaluru', '575016': 'Mangaluru', '575017': 'Mangaluru',
  '575020': 'Mangaluru', '575021': 'Mangaluru', '575022': 'Mangaluru', '575023': 'Mangaluru',
  '575025': 'Mangaluru', '575028': 'Mangaluru', '575030': 'Mangaluru',
  // Hubballi
  '580001': 'Hubballi', '580002': 'Hubballi', '580003': 'Hubballi', '580007': 'Hubballi',
  '580008': 'Hubballi', '580009': 'Hubballi', '580020': 'Hubballi', '580021': 'Hubballi',
  '580023': 'Hubballi', '580024': 'Hubballi', '580025': 'Hubballi', '580028': 'Hubballi',
  '580029': 'Hubballi', '580030': 'Hubballi', '580031': 'Hubballi', '580032': 'Hubballi',
  // Belagavi (Belgaum)
  '590001': 'Belagavi', '590002': 'Belagavi', '590003': 'Belagavi', '590004': 'Belagavi',
  '590006': 'Belagavi', '590008': 'Belagavi', '590010': 'Belagavi', '590011': 'Belagavi',
  '590016': 'Belagavi', '590018': 'Belagavi', '590019': 'Belagavi',

  // ── TAMIL NADU ────────────────────────────────────────────────────────────
  // Chennai
  '600001': 'Chennai', '600002': 'Chennai', '600003': 'Chennai', '600004': 'Chennai',
  '600005': 'Chennai', '600006': 'Chennai', '600007': 'Chennai', '600008': 'Chennai',
  '600009': 'Chennai', '600010': 'Chennai', '600011': 'Chennai', '600012': 'Chennai',
  '600013': 'Chennai', '600014': 'Chennai', '600015': 'Chennai', '600016': 'Chennai',
  '600017': 'Chennai', '600018': 'Chennai', '600019': 'Chennai', '600020': 'Chennai',
  '600021': 'Chennai', '600022': 'Chennai', '600023': 'Chennai', '600024': 'Chennai',
  '600025': 'Chennai', '600026': 'Chennai', '600027': 'Chennai', '600028': 'Chennai',
  '600029': 'Chennai', '600030': 'Chennai', '600031': 'Chennai', '600032': 'Chennai',
  '600033': 'Chennai', '600034': 'Chennai', '600035': 'Chennai', '600036': 'Chennai',
  '600037': 'Chennai', '600038': 'Chennai', '600039': 'Chennai', '600040': 'Chennai',
  '600041': 'Chennai', '600042': 'Chennai', '600043': 'Chennai', '600044': 'Chennai',
  '600045': 'Chennai', '600046': 'Chennai', '600047': 'Chennai', '600048': 'Chennai',
  '600049': 'Chennai', '600050': 'Chennai', '600051': 'Chennai', '600052': 'Chennai',
  '600053': 'Chennai', '600054': 'Chennai', '600055': 'Chennai', '600056': 'Chennai',
  '600057': 'Chennai', '600058': 'Chennai', '600059': 'Chennai', '600060': 'Chennai',
  '600061': 'Chennai', '600062': 'Chennai', '600063': 'Chennai', '600064': 'Chennai',
  '600065': 'Chennai', '600066': 'Chennai', '600067': 'Chennai', '600068': 'Chennai',
  '600069': 'Chennai', '600070': 'Chennai', '600071': 'Chennai', '600072': 'Chennai',
  '600073': 'Chennai', '600074': 'Chennai', '600075': 'Chennai', '600076': 'Chennai',
  '600077': 'Chennai', '600078': 'Chennai', '600079': 'Chennai', '600080': 'Chennai',
  '600081': 'Chennai', '600082': 'Chennai', '600083': 'Chennai', '600084': 'Chennai',
  '600085': 'Chennai', '600086': 'Chennai', '600087': 'Chennai', '600088': 'Chennai',
  '600089': 'Chennai', '600090': 'Chennai', '600091': 'Chennai', '600092': 'Chennai',
  '600093': 'Chennai', '600094': 'Chennai', '600095': 'Chennai', '600096': 'Chennai',
  '600097': 'Chennai', '600098': 'Chennai', '600099': 'Chennai', '600100': 'Chennai',
  '600101': 'Chennai', '600102': 'Chennai', '600103': 'Chennai', '600104': 'Chennai',
  '600105': 'Chennai', '600106': 'Chennai', '600107': 'Chennai', '600108': 'Chennai',
  '600109': 'Chennai', '600110': 'Chennai', '600111': 'Chennai', '600112': 'Chennai',
  '600113': 'Chennai', '600114': 'Chennai', '600115': 'Chennai', '600116': 'Chennai',
  '600117': 'Chennai', '600118': 'Chennai', '600119': 'Chennai',
  // Coimbatore
  '641001': 'Coimbatore', '641002': 'Coimbatore', '641003': 'Coimbatore', '641004': 'Coimbatore',
  '641005': 'Coimbatore', '641006': 'Coimbatore', '641007': 'Coimbatore', '641008': 'Coimbatore',
  '641009': 'Coimbatore', '641010': 'Coimbatore', '641011': 'Coimbatore', '641012': 'Coimbatore',
  '641013': 'Coimbatore', '641014': 'Coimbatore', '641015': 'Coimbatore', '641016': 'Coimbatore',
  '641017': 'Coimbatore', '641018': 'Coimbatore', '641019': 'Coimbatore', '641020': 'Coimbatore',
  '641021': 'Coimbatore', '641022': 'Coimbatore', '641023': 'Coimbatore', '641024': 'Coimbatore',
  '641025': 'Coimbatore', '641026': 'Coimbatore', '641027': 'Coimbatore', '641028': 'Coimbatore',
  '641029': 'Coimbatore', '641030': 'Coimbatore', '641031': 'Coimbatore', '641032': 'Coimbatore',
  '641033': 'Coimbatore', '641034': 'Coimbatore', '641035': 'Coimbatore', '641036': 'Coimbatore',
  '641037': 'Coimbatore', '641038': 'Coimbatore', '641039': 'Coimbatore', '641041': 'Coimbatore',
  '641042': 'Coimbatore', '641043': 'Coimbatore', '641044': 'Coimbatore', '641045': 'Coimbatore',
  '641046': 'Coimbatore', '641047': 'Coimbatore', '641048': 'Coimbatore', '641062': 'Coimbatore',
  // Madurai
  '625001': 'Madurai', '625002': 'Madurai', '625003': 'Madurai', '625004': 'Madurai',
  '625005': 'Madurai', '625006': 'Madurai', '625007': 'Madurai', '625008': 'Madurai',
  '625009': 'Madurai', '625010': 'Madurai', '625011': 'Madurai', '625012': 'Madurai',
  '625014': 'Madurai', '625016': 'Madurai', '625017': 'Madurai', '625018': 'Madurai',
  '625020': 'Madurai',
  // Tiruchirappalli
  '620001': 'Tiruchirappalli', '620002': 'Tiruchirappalli', '620003': 'Tiruchirappalli',
  '620004': 'Tiruchirappalli', '620005': 'Tiruchirappalli', '620006': 'Tiruchirappalli',
  '620007': 'Tiruchirappalli', '620008': 'Tiruchirappalli', '620009': 'Tiruchirappalli',
  '620010': 'Tiruchirappalli', '620011': 'Tiruchirappalli', '620012': 'Tiruchirappalli',
  '620017': 'Tiruchirappalli', '620018': 'Tiruchirappalli', '620020': 'Tiruchirappalli',
  '620021': 'Tiruchirappalli', '620025': 'Tiruchirappalli',
  // Salem
  '636001': 'Salem', '636002': 'Salem', '636003': 'Salem', '636004': 'Salem',
  '636005': 'Salem', '636006': 'Salem', '636007': 'Salem', '636008': 'Salem',
  '636009': 'Salem', '636010': 'Salem', '636011': 'Salem', '636012': 'Salem',
  '636013': 'Salem', '636014': 'Salem', '636015': 'Salem', '636016': 'Salem',
  // Tirunelveli
  '627001': 'Tirunelveli', '627002': 'Tirunelveli', '627003': 'Tirunelveli',
  '627004': 'Tirunelveli', '627005': 'Tirunelveli', '627006': 'Tirunelveli',
  '627007': 'Tirunelveli', '627008': 'Tirunelveli', '627011': 'Tirunelveli',
  '627012': 'Tirunelveli',
  // Vellore
  '632001': 'Vellore', '632002': 'Vellore', '632004': 'Vellore', '632006': 'Vellore',
  '632007': 'Vellore', '632009': 'Vellore', '632011': 'Vellore', '632013': 'Vellore',
  // Puducherry
  '605001': 'Puducherry', '605002': 'Puducherry', '605003': 'Puducherry', '605004': 'Puducherry',
  '605005': 'Puducherry', '605006': 'Puducherry', '605007': 'Puducherry', '605008': 'Puducherry',
  '605009': 'Puducherry', '605010': 'Puducherry', '605011': 'Puducherry', '605012': 'Puducherry',
  '605013': 'Puducherry', '605014': 'Puducherry',

  // ── TELANGANA ─────────────────────────────────────────────────────────────
  // Hyderabad
  '500001': 'Hyderabad', '500002': 'Hyderabad', '500003': 'Hyderabad', '500004': 'Hyderabad',
  '500005': 'Hyderabad', '500006': 'Hyderabad', '500007': 'Hyderabad', '500008': 'Hyderabad',
  '500009': 'Hyderabad', '500010': 'Hyderabad', '500011': 'Hyderabad', '500012': 'Hyderabad',
  '500013': 'Hyderabad', '500014': 'Hyderabad', '500015': 'Hyderabad', '500016': 'Hyderabad',
  '500017': 'Hyderabad', '500018': 'Hyderabad', '500019': 'Hyderabad', '500020': 'Hyderabad',
  '500021': 'Hyderabad', '500022': 'Hyderabad', '500023': 'Hyderabad', '500024': 'Hyderabad',
  '500025': 'Hyderabad', '500026': 'Hyderabad', '500027': 'Hyderabad', '500028': 'Hyderabad',
  '500029': 'Hyderabad', '500030': 'Hyderabad', '500031': 'Hyderabad', '500032': 'Hyderabad',
  '500033': 'Hyderabad', '500034': 'Hyderabad', '500035': 'Hyderabad', '500036': 'Hyderabad',
  '500037': 'Hyderabad', '500038': 'Hyderabad', '500039': 'Hyderabad', '500040': 'Hyderabad',
  '500041': 'Hyderabad', '500042': 'Hyderabad', '500043': 'Hyderabad', '500044': 'Hyderabad',
  '500045': 'Hyderabad', '500046': 'Hyderabad', '500047': 'Hyderabad', '500048': 'Hyderabad',
  '500049': 'Hyderabad', '500050': 'Hyderabad', '500051': 'Hyderabad', '500052': 'Hyderabad',
  '500053': 'Hyderabad', '500054': 'Hyderabad', '500055': 'Hyderabad', '500056': 'Hyderabad',
  '500057': 'Hyderabad', '500058': 'Hyderabad', '500059': 'Hyderabad', '500060': 'Hyderabad',
  '500061': 'Hyderabad', '500062': 'Hyderabad', '500063': 'Hyderabad', '500064': 'Hyderabad',
  '500065': 'Hyderabad', '500066': 'Hyderabad', '500067': 'Hyderabad', '500068': 'Hyderabad',
  '500069': 'Hyderabad', '500070': 'Hyderabad', '500071': 'Hyderabad', '500072': 'Hyderabad',
  '500073': 'Hyderabad', '500074': 'Hyderabad', '500075': 'Hyderabad', '500076': 'Hyderabad',
  '500077': 'Hyderabad', '500078': 'Hyderabad', '500079': 'Hyderabad', '500080': 'Hyderabad',
  '500081': 'Hyderabad', '500082': 'Hyderabad', '500083': 'Hyderabad', '500084': 'Hyderabad',
  '500085': 'Hyderabad', '500086': 'Hyderabad', '500087': 'Hyderabad', '500088': 'Hyderabad',
  '500089': 'Hyderabad', '500090': 'Hyderabad', '500091': 'Hyderabad', '500092': 'Hyderabad',
  '500093': 'Hyderabad', '500094': 'Hyderabad', '500095': 'Hyderabad', '500096': 'Hyderabad',
  // Warangal
  '506001': 'Warangal', '506002': 'Warangal', '506003': 'Warangal', '506004': 'Warangal',
  '506005': 'Warangal', '506006': 'Warangal', '506007': 'Warangal', '506009': 'Warangal',
  '506011': 'Warangal', '506013': 'Warangal', '506015': 'Warangal',
  // Karimnagar
  '505001': 'Karimnagar', '505002': 'Karimnagar', '505004': 'Karimnagar', '505006': 'Karimnagar',
  // Nizamabad
  '503001': 'Nizamabad', '503002': 'Nizamabad', '503003': 'Nizamabad',
  // Khammam
  '507001': 'Khammam', '507002': 'Khammam', '507003': 'Khammam',

  // ── ANDHRA PRADESH ────────────────────────────────────────────────────────
  // Visakhapatnam
  '530001': 'Visakhapatnam', '530002': 'Visakhapatnam', '530003': 'Visakhapatnam',
  '530004': 'Visakhapatnam', '530005': 'Visakhapatnam', '530006': 'Visakhapatnam',
  '530007': 'Visakhapatnam', '530008': 'Visakhapatnam', '530009': 'Visakhapatnam',
  '530010': 'Visakhapatnam', '530011': 'Visakhapatnam', '530012': 'Visakhapatnam',
  '530013': 'Visakhapatnam', '530014': 'Visakhapatnam', '530015': 'Visakhapatnam',
  '530016': 'Visakhapatnam', '530017': 'Visakhapatnam', '530018': 'Visakhapatnam',
  '530019': 'Visakhapatnam', '530020': 'Visakhapatnam', '530021': 'Visakhapatnam',
  '530022': 'Visakhapatnam', '530023': 'Visakhapatnam', '530024': 'Visakhapatnam',
  '530026': 'Visakhapatnam', '530027': 'Visakhapatnam', '530028': 'Visakhapatnam',
  '530029': 'Visakhapatnam', '530035': 'Visakhapatnam', '530040': 'Visakhapatnam',
  '530041': 'Visakhapatnam', '530043': 'Visakhapatnam', '530044': 'Visakhapatnam',
  '530045': 'Visakhapatnam', '530046': 'Visakhapatnam', '530047': 'Visakhapatnam',
  '530048': 'Visakhapatnam', '530051': 'Visakhapatnam', '530053': 'Visakhapatnam',
  // Vijayawada
  '520001': 'Vijayawada', '520002': 'Vijayawada', '520003': 'Vijayawada', '520004': 'Vijayawada',
  '520005': 'Vijayawada', '520006': 'Vijayawada', '520007': 'Vijayawada', '520008': 'Vijayawada',
  '520010': 'Vijayawada', '520011': 'Vijayawada', '520012': 'Vijayawada', '520013': 'Vijayawada',
  '520015': 'Vijayawada',
  // Guntur
  '522001': 'Guntur', '522002': 'Guntur', '522003': 'Guntur', '522004': 'Guntur',
  '522005': 'Guntur', '522006': 'Guntur', '522007': 'Guntur', '522010': 'Guntur',
  '522012': 'Guntur', '522013': 'Guntur', '522014': 'Guntur', '522015': 'Guntur',
  '522016': 'Guntur', '522017': 'Guntur', '522018': 'Guntur', '522019': 'Guntur',
  // Tirupati
  '517501': 'Tirupati', '517502': 'Tirupati', '517503': 'Tirupati', '517504': 'Tirupati',
  '517505': 'Tirupati', '517506': 'Tirupati', '517507': 'Tirupati',
  // Nellore
  '524001': 'Nellore', '524002': 'Nellore', '524003': 'Nellore', '524004': 'Nellore',
  '524005': 'Nellore', '524006': 'Nellore',
  // Amaravati (capital)
  '522020': 'Amaravati', '522021': 'Amaravati', '522022': 'Amaravati',

  // ── WEST BENGAL ───────────────────────────────────────────────────────────
  // Kolkata
  '700001': 'Kolkata', '700002': 'Kolkata', '700003': 'Kolkata', '700004': 'Kolkata',
  '700005': 'Kolkata', '700006': 'Kolkata', '700007': 'Kolkata', '700008': 'Kolkata',
  '700009': 'Kolkata', '700010': 'Kolkata', '700011': 'Kolkata', '700012': 'Kolkata',
  '700013': 'Kolkata', '700014': 'Kolkata', '700015': 'Kolkata', '700016': 'Kolkata',
  '700017': 'Kolkata', '700018': 'Kolkata', '700019': 'Kolkata', '700020': 'Kolkata',
  '700021': 'Kolkata', '700022': 'Kolkata', '700023': 'Kolkata', '700024': 'Kolkata',
  '700025': 'Kolkata', '700026': 'Kolkata', '700027': 'Kolkata', '700028': 'Kolkata',
  '700029': 'Kolkata', '700030': 'Kolkata', '700031': 'Kolkata', '700032': 'Kolkata',
  '700033': 'Kolkata', '700034': 'Kolkata', '700035': 'Kolkata', '700036': 'Kolkata',
  '700037': 'Kolkata', '700038': 'Kolkata', '700039': 'Kolkata', '700040': 'Kolkata',
  '700041': 'Kolkata', '700042': 'Kolkata', '700043': 'Kolkata', '700044': 'Kolkata',
  '700045': 'Kolkata', '700046': 'Kolkata', '700047': 'Kolkata', '700048': 'Kolkata',
  '700049': 'Kolkata', '700050': 'Kolkata', '700051': 'Kolkata', '700052': 'Kolkata',
  '700053': 'Kolkata', '700054': 'Kolkata', '700055': 'Kolkata', '700056': 'Kolkata',
  '700057': 'Kolkata', '700058': 'Kolkata', '700059': 'Kolkata', '700060': 'Kolkata',
  '700061': 'Kolkata', '700062': 'Kolkata', '700063': 'Kolkata', '700064': 'Kolkata',
  '700065': 'Kolkata', '700066': 'Kolkata', '700067': 'Kolkata', '700068': 'Kolkata',
  '700069': 'Kolkata', '700070': 'Kolkata', '700071': 'Kolkata', '700072': 'Kolkata',
  '700073': 'Kolkata', '700074': 'Kolkata', '700075': 'Kolkata', '700076': 'Kolkata',
  '700077': 'Kolkata', '700078': 'Kolkata', '700079': 'Kolkata', '700080': 'Kolkata',
  '700081': 'Kolkata', '700082': 'Kolkata', '700083': 'Kolkata', '700084': 'Kolkata',
  '700085': 'Kolkata', '700086': 'Kolkata', '700087': 'Kolkata', '700088': 'Kolkata',
  '700089': 'Kolkata', '700090': 'Kolkata', '700091': 'Kolkata', '700092': 'Kolkata',
  '700093': 'Kolkata', '700094': 'Kolkata', '700095': 'Kolkata', '700096': 'Kolkata',
  '700097': 'Kolkata', '700098': 'Kolkata', '700099': 'Kolkata', '700100': 'Kolkata',
  '700101': 'Kolkata', '700102': 'Kolkata', '700103': 'Kolkata', '700104': 'Kolkata',
  '700105': 'Kolkata', '700106': 'Kolkata', '700107': 'Kolkata', '700108': 'Kolkata',
  '700109': 'Kolkata', '700110': 'Kolkata', '700111': 'Kolkata', '700112': 'Kolkata',
  '700113': 'Kolkata', '700114': 'Kolkata', '700115': 'Kolkata', '700116': 'Kolkata',
  '700117': 'Kolkata', '700118': 'Kolkata', '700119': 'Kolkata', '700120': 'Kolkata',
  '700121': 'Kolkata', '700122': 'Kolkata', '700123': 'Kolkata', '700124': 'Kolkata',
  '700125': 'Kolkata', '700126': 'Kolkata', '700127': 'Kolkata', '700128': 'Kolkata',
  '700129': 'Kolkata', '700130': 'Kolkata', '700131': 'Kolkata', '700132': 'Kolkata',
  '700133': 'Kolkata', '700134': 'Kolkata', '700135': 'Kolkata', '700136': 'Kolkata',
  '700137': 'Kolkata', '700138': 'Kolkata', '700139': 'Kolkata', '700140': 'Kolkata',
  '700141': 'Kolkata', '700142': 'Kolkata', '700143': 'Kolkata', '700144': 'Kolkata',
  '700145': 'Kolkata', '700146': 'Kolkata', '700147': 'Kolkata', '700148': 'Kolkata',
  '700149': 'Kolkata', '700150': 'Kolkata', '700151': 'Kolkata', '700152': 'Kolkata',
  '700153': 'Kolkata', '700154': 'Kolkata', '700155': 'Kolkata', '700156': 'Kolkata',
  '700157': 'Kolkata', '700158': 'Kolkata', '700159': 'Kolkata', '700160': 'Kolkata',
  // Howrah
  '711101': 'Howrah', '711102': 'Howrah', '711103': 'Howrah', '711104': 'Howrah',
  '711105': 'Howrah', '711106': 'Howrah', '711107': 'Howrah', '711108': 'Howrah',
  '711109': 'Howrah', '711110': 'Howrah', '711111': 'Howrah', '711112': 'Howrah',
  '711113': 'Howrah', '711114': 'Howrah',
  // Durgapur
  '713201': 'Durgapur', '713202': 'Durgapur', '713203': 'Durgapur', '713204': 'Durgapur',
  '713205': 'Durgapur', '713206': 'Durgapur', '713207': 'Durgapur', '713208': 'Durgapur',
  '713209': 'Durgapur', '713210': 'Durgapur', '713212': 'Durgapur', '713216': 'Durgapur',
  // Siliguri
  '734001': 'Siliguri', '734002': 'Siliguri', '734003': 'Siliguri', '734004': 'Siliguri',
  '734005': 'Siliguri', '734006': 'Siliguri', '734007': 'Siliguri', '734008': 'Siliguri',
  '734009': 'Siliguri', '734010': 'Siliguri',

  // ── GUJARAT ───────────────────────────────────────────────────────────────
  // Ahmedabad
  '380001': 'Ahmedabad', '380002': 'Ahmedabad', '380003': 'Ahmedabad', '380004': 'Ahmedabad',
  '380005': 'Ahmedabad', '380006': 'Ahmedabad', '380007': 'Ahmedabad', '380008': 'Ahmedabad',
  '380009': 'Ahmedabad', '380010': 'Ahmedabad', '380013': 'Ahmedabad', '380014': 'Ahmedabad',
  '380015': 'Ahmedabad', '380016': 'Ahmedabad', '380018': 'Ahmedabad', '380019': 'Ahmedabad',
  '380020': 'Ahmedabad', '380021': 'Ahmedabad', '380022': 'Ahmedabad', '380023': 'Ahmedabad',
  '380024': 'Ahmedabad', '380025': 'Ahmedabad', '380026': 'Ahmedabad', '380027': 'Ahmedabad',
  '380028': 'Ahmedabad', '380050': 'Ahmedabad', '380051': 'Ahmedabad', '380052': 'Ahmedabad',
  '380053': 'Ahmedabad', '380054': 'Ahmedabad', '380055': 'Ahmedabad', '380058': 'Ahmedabad',
  '380059': 'Ahmedabad', '380060': 'Ahmedabad', '380061': 'Ahmedabad', '380063': 'Ahmedabad',
  // Surat
  '395001': 'Surat', '395002': 'Surat', '395003': 'Surat', '395004': 'Surat',
  '395005': 'Surat', '395006': 'Surat', '395007': 'Surat', '395008': 'Surat',
  '395009': 'Surat', '395010': 'Surat', '395011': 'Surat', '395012': 'Surat',
  '395013': 'Surat', '395014': 'Surat', '395015': 'Surat', '395016': 'Surat',
  '395017': 'Surat', '395018': 'Surat', '395019': 'Surat', '395020': 'Surat',
  '395021': 'Surat', '395022': 'Surat', '395023': 'Surat',
  // Vadodara
  '390001': 'Vadodara', '390002': 'Vadodara', '390003': 'Vadodara', '390004': 'Vadodara',
  '390005': 'Vadodara', '390006': 'Vadodara', '390007': 'Vadodara', '390008': 'Vadodara',
  '390009': 'Vadodara', '390010': 'Vadodara', '390011': 'Vadodara', '390012': 'Vadodara',
  '390013': 'Vadodara', '390014': 'Vadodara', '390015': 'Vadodara', '390016': 'Vadodara',
  '390017': 'Vadodara', '390018': 'Vadodara', '390019': 'Vadodara', '390020': 'Vadodara',
  '390021': 'Vadodara', '390022': 'Vadodara', '390023': 'Vadodara', '390024': 'Vadodara',
  '390025': 'Vadodara',
  // Rajkot
  '360001': 'Rajkot', '360002': 'Rajkot', '360003': 'Rajkot', '360004': 'Rajkot',
  '360005': 'Rajkot', '360006': 'Rajkot', '360007': 'Rajkot',
  // Gandhinagar
  '382001': 'Gandhinagar', '382002': 'Gandhinagar', '382006': 'Gandhinagar',
  '382007': 'Gandhinagar', '382008': 'Gandhinagar', '382009': 'Gandhinagar',
  '382010': 'Gandhinagar', '382011': 'Gandhinagar', '382015': 'Gandhinagar',
  '382016': 'Gandhinagar', '382017': 'Gandhinagar', '382020': 'Gandhinagar',
  '382021': 'Gandhinagar', '382022': 'Gandhinagar', '382023': 'Gandhinagar',
  '382024': 'Gandhinagar', '382025': 'Gandhinagar', '382028': 'Gandhinagar',
  '382030': 'Gandhinagar',
  // Bhavnagar
  '364001': 'Bhavnagar', '364002': 'Bhavnagar', '364003': 'Bhavnagar', '364004': 'Bhavnagar',
  '364005': 'Bhavnagar', '364006': 'Bhavnagar',
  // Jamnagar
  '361001': 'Jamnagar', '361002': 'Jamnagar', '361003': 'Jamnagar', '361004': 'Jamnagar',
  '361005': 'Jamnagar', '361006': 'Jamnagar', '361007': 'Jamnagar', '361008': 'Jamnagar',

  // ── RAJASTHAN ─────────────────────────────────────────────────────────────
  // Jaipur
  '302001': 'Jaipur', '302002': 'Jaipur', '302003': 'Jaipur', '302004': 'Jaipur',
  '302005': 'Jaipur', '302006': 'Jaipur', '302007': 'Jaipur', '302010': 'Jaipur',
  '302011': 'Jaipur', '302012': 'Jaipur', '302013': 'Jaipur', '302015': 'Jaipur',
  '302016': 'Jaipur', '302017': 'Jaipur', '302018': 'Jaipur', '302019': 'Jaipur',
  '302020': 'Jaipur', '302021': 'Jaipur', '302022': 'Jaipur', '302023': 'Jaipur',
  '302024': 'Jaipur', '302025': 'Jaipur', '302026': 'Jaipur', '302027': 'Jaipur',
  '302028': 'Jaipur', '302029': 'Jaipur', '302030': 'Jaipur', '302031': 'Jaipur',
  '302033': 'Jaipur', '302034': 'Jaipur', '302036': 'Jaipur', '302037': 'Jaipur',
  '302038': 'Jaipur', '302039': 'Jaipur',
  // Jodhpur
  '342001': 'Jodhpur', '342002': 'Jodhpur', '342003': 'Jodhpur', '342004': 'Jodhpur',
  '342005': 'Jodhpur', '342006': 'Jodhpur', '342007': 'Jodhpur', '342008': 'Jodhpur',
  '342009': 'Jodhpur', '342010': 'Jodhpur', '342011': 'Jodhpur', '342012': 'Jodhpur',
  '342013': 'Jodhpur', '342014': 'Jodhpur', '342015': 'Jodhpur',
  // Udaipur
  '313001': 'Udaipur', '313002': 'Udaipur', '313003': 'Udaipur', '313004': 'Udaipur',
  '313005': 'Udaipur', '313006': 'Udaipur', '313007': 'Udaipur', '313011': 'Udaipur',
  '313015': 'Udaipur',
  // Kota
  '324001': 'Kota', '324002': 'Kota', '324003': 'Kota', '324004': 'Kota',
  '324005': 'Kota', '324006': 'Kota', '324007': 'Kota', '324008': 'Kota',
  '324009': 'Kota', '324010': 'Kota',
  // Ajmer
  '305001': 'Ajmer', '305002': 'Ajmer', '305003': 'Ajmer', '305004': 'Ajmer',
  '305005': 'Ajmer', '305006': 'Ajmer', '305007': 'Ajmer', '305008': 'Ajmer',
  '305009': 'Ajmer',
  // Bikaner
  '334001': 'Bikaner', '334002': 'Bikaner', '334003': 'Bikaner', '334004': 'Bikaner',
  '334005': 'Bikaner', '334006': 'Bikaner',
  // Alwar
  '301001': 'Alwar', '301002': 'Alwar', '301003': 'Alwar',

  // ── MADHYA PRADESH ────────────────────────────────────────────────────────
  // Bhopal
  '462001': 'Bhopal', '462002': 'Bhopal', '462003': 'Bhopal', '462004': 'Bhopal',
  '462007': 'Bhopal', '462008': 'Bhopal', '462010': 'Bhopal', '462011': 'Bhopal',
  '462012': 'Bhopal', '462016': 'Bhopal', '462020': 'Bhopal', '462021': 'Bhopal',
  '462022': 'Bhopal', '462023': 'Bhopal', '462024': 'Bhopal', '462026': 'Bhopal',
  '462027': 'Bhopal', '462030': 'Bhopal', '462031': 'Bhopal', '462033': 'Bhopal',
  '462036': 'Bhopal', '462037': 'Bhopal', '462038': 'Bhopal', '462039': 'Bhopal',
  '462040': 'Bhopal', '462041': 'Bhopal', '462042': 'Bhopal', '462043': 'Bhopal',
  '462044': 'Bhopal', '462046': 'Bhopal',
  // Indore
  '452001': 'Indore', '452002': 'Indore', '452003': 'Indore', '452004': 'Indore',
  '452005': 'Indore', '452006': 'Indore', '452007': 'Indore', '452008': 'Indore',
  '452009': 'Indore', '452010': 'Indore', '452011': 'Indore', '452012': 'Indore',
  '452013': 'Indore', '452014': 'Indore', '452015': 'Indore', '452016': 'Indore',
  '452018': 'Indore', '452020': 'Indore',
  // Gwalior
  '474001': 'Gwalior', '474002': 'Gwalior', '474003': 'Gwalior', '474004': 'Gwalior',
  '474005': 'Gwalior', '474006': 'Gwalior', '474007': 'Gwalior', '474008': 'Gwalior',
  '474009': 'Gwalior', '474010': 'Gwalior', '474011': 'Gwalior', '474012': 'Gwalior',
  // Jabalpur
  '482001': 'Jabalpur', '482002': 'Jabalpur', '482003': 'Jabalpur', '482004': 'Jabalpur',
  '482005': 'Jabalpur', '482006': 'Jabalpur', '482007': 'Jabalpur', '482008': 'Jabalpur',
  '482009': 'Jabalpur', '482010': 'Jabalpur', '482011': 'Jabalpur', '482012': 'Jabalpur',
  // Ujjain
  '456001': 'Ujjain', '456002': 'Ujjain', '456003': 'Ujjain', '456006': 'Ujjain',
  '456010': 'Ujjain',

  // ── UTTAR PRADESH ─────────────────────────────────────────────────────────
  // Lucknow
  '226001': 'Lucknow', '226002': 'Lucknow', '226003': 'Lucknow', '226004': 'Lucknow',
  '226005': 'Lucknow', '226006': 'Lucknow', '226007': 'Lucknow', '226008': 'Lucknow',
  '226009': 'Lucknow', '226010': 'Lucknow', '226011': 'Lucknow', '226012': 'Lucknow',
  '226013': 'Lucknow', '226014': 'Lucknow', '226015': 'Lucknow', '226016': 'Lucknow',
  '226017': 'Lucknow', '226018': 'Lucknow', '226019': 'Lucknow', '226020': 'Lucknow',
  '226021': 'Lucknow', '226022': 'Lucknow', '226023': 'Lucknow', '226024': 'Lucknow',
  '226025': 'Lucknow', '226026': 'Lucknow', '226028': 'Lucknow', '226029': 'Lucknow',
  '226030': 'Lucknow',
  // Kanpur
  '208001': 'Kanpur', '208002': 'Kanpur', '208003': 'Kanpur', '208004': 'Kanpur',
  '208005': 'Kanpur', '208006': 'Kanpur', '208007': 'Kanpur', '208008': 'Kanpur',
  '208009': 'Kanpur', '208010': 'Kanpur', '208011': 'Kanpur', '208012': 'Kanpur',
  '208013': 'Kanpur', '208014': 'Kanpur', '208015': 'Kanpur', '208016': 'Kanpur',
  '208017': 'Kanpur', '208019': 'Kanpur', '208020': 'Kanpur', '208021': 'Kanpur',
  '208022': 'Kanpur', '208023': 'Kanpur', '208024': 'Kanpur', '208025': 'Kanpur',
  '208026': 'Kanpur', '208027': 'Kanpur',
  // Agra
  '282001': 'Agra', '282002': 'Agra', '282003': 'Agra', '282004': 'Agra',
  '282005': 'Agra', '282006': 'Agra', '282007': 'Agra', '282008': 'Agra',
  '282009': 'Agra', '282010': 'Agra',
  // Varanasi
  '221001': 'Varanasi', '221002': 'Varanasi', '221003': 'Varanasi', '221004': 'Varanasi',
  '221005': 'Varanasi', '221006': 'Varanasi', '221007': 'Varanasi', '221008': 'Varanasi',
  '221009': 'Varanasi', '221010': 'Varanasi', '221011': 'Varanasi', '221012': 'Varanasi',
  // Prayagraj (Allahabad)
  '211001': 'Prayagraj', '211002': 'Prayagraj', '211003': 'Prayagraj', '211004': 'Prayagraj',
  '211005': 'Prayagraj', '211006': 'Prayagraj', '211007': 'Prayagraj', '211008': 'Prayagraj',
  '211009': 'Prayagraj', '211010': 'Prayagraj', '211011': 'Prayagraj', '211012': 'Prayagraj',
  '211013': 'Prayagraj', '211014': 'Prayagraj', '211015': 'Prayagraj', '211016': 'Prayagraj',
  '211017': 'Prayagraj', '211018': 'Prayagraj',
  // Meerut
  '250001': 'Meerut', '250002': 'Meerut', '250003': 'Meerut', '250004': 'Meerut',
  '250005': 'Meerut', '250006': 'Meerut',
  // Bareilly
  '243001': 'Bareilly', '243002': 'Bareilly', '243003': 'Bareilly', '243005': 'Bareilly',
  '243006': 'Bareilly',
  // Moradabad
  '244001': 'Moradabad', '244002': 'Moradabad', '244003': 'Moradabad',
  // Aligarh
  '202001': 'Aligarh', '202002': 'Aligarh', '202003': 'Aligarh',
  // Gorakhpur
  '273001': 'Gorakhpur', '273002': 'Gorakhpur', '273003': 'Gorakhpur', '273004': 'Gorakhpur',
  '273005': 'Gorakhpur', '273006': 'Gorakhpur', '273007': 'Gorakhpur', '273009': 'Gorakhpur',
  // Mathura
  '281001': 'Mathura', '281002': 'Mathura', '281003': 'Mathura', '281004': 'Mathura',

  // ── PUNJAB ────────────────────────────────────────────────────────────────
  // Amritsar
  '143001': 'Amritsar', '143002': 'Amritsar', '143006': 'Amritsar', '143009': 'Amritsar',
  '143101': 'Amritsar', '143105': 'Amritsar', '143107': 'Amritsar', '143108': 'Amritsar',
  // Ludhiana
  '141001': 'Ludhiana', '141002': 'Ludhiana', '141003': 'Ludhiana', '141004': 'Ludhiana',
  '141005': 'Ludhiana', '141006': 'Ludhiana', '141007': 'Ludhiana', '141008': 'Ludhiana',
  '141009': 'Ludhiana', '141010': 'Ludhiana', '141012': 'Ludhiana',
  // Jalandhar
  '144001': 'Jalandhar', '144002': 'Jalandhar', '144003': 'Jalandhar', '144004': 'Jalandhar',
  '144005': 'Jalandhar', '144006': 'Jalandhar', '144007': 'Jalandhar', '144008': 'Jalandhar',
  '144009': 'Jalandhar',
  // Patiala
  '147001': 'Patiala', '147002': 'Patiala', '147003': 'Patiala', '147004': 'Patiala',
  '147005': 'Patiala', '147006': 'Patiala', '147007': 'Patiala',
  // Mohali (SAS Nagar)
  '140301': 'Mohali', '160062': 'Mohali', '160071': 'Mohali',

  // ── HARYANA ───────────────────────────────────────────────────────────────
  // Hisar
  '125001': 'Hisar', '125002': 'Hisar', '125003': 'Hisar', '125004': 'Hisar',
  '125005': 'Hisar', '125006': 'Hisar',
  // Ambala
  '134001': 'Ambala', '134002': 'Ambala', '134003': 'Ambala', '134007': 'Ambala',
  // Rohtak
  '124001': 'Rohtak', '124002': 'Rohtak', '124003': 'Rohtak', '124004': 'Rohtak',
  // Karnal
  '132001': 'Karnal', '132002': 'Karnal', '132003': 'Karnal',

  // ── HIMACHAL PRADESH ──────────────────────────────────────────────────────
  '171001': 'Shimla', '171002': 'Shimla', '171003': 'Shimla', '171004': 'Shimla',
  '171005': 'Shimla', '171006': 'Shimla', '171007': 'Shimla', '171008': 'Shimla',
  '171009': 'Shimla', '171010': 'Shimla', '171011': 'Shimla', '171012': 'Shimla',
  '171013': 'Shimla', '171014': 'Shimla', '171015': 'Shimla', '171016': 'Shimla',
  '175001': 'Mandi', '175002': 'Mandi',
  '176001': 'Kangra', '176002': 'Kangra',
  '174001': 'Bilaspur',

  // ── UTTARAKHAND ───────────────────────────────────────────────────────────
  '248001': 'Dehradun', '248002': 'Dehradun', '248003': 'Dehradun', '248004': 'Dehradun',
  '248005': 'Dehradun', '248006': 'Dehradun', '248007': 'Dehradun', '248008': 'Dehradun',
  '248009': 'Dehradun', '248010': 'Dehradun', '248011': 'Dehradun', '248012': 'Dehradun',
  '248013': 'Dehradun', '248014': 'Dehradun', '248015': 'Dehradun',
  '249001': 'Haridwar', '249401': 'Rishikesh',
  '263001': 'Nainital', '263002': 'Nainital',
  '263139': 'Haldwani', '263140': 'Haldwani', '263141': 'Haldwani',
  '247001': 'Roorkee', '247667': 'Roorkee',

  // ── BIHAR ─────────────────────────────────────────────────────────────────
  // Patna
  '800001': 'Patna', '800002': 'Patna', '800003': 'Patna', '800004': 'Patna',
  '800005': 'Patna', '800006': 'Patna', '800007': 'Patna', '800008': 'Patna',
  '800009': 'Patna', '800010': 'Patna', '800011': 'Patna', '800012': 'Patna',
  '800013': 'Patna', '800014': 'Patna', '800015': 'Patna', '800016': 'Patna',
  '800017': 'Patna', '800018': 'Patna', '800019': 'Patna', '800020': 'Patna',
  '800023': 'Patna', '800024': 'Patna', '800025': 'Patna', '800026': 'Patna',
  '800027': 'Patna', '800029': 'Patna',
  '842001': 'Muzaffarpur', '842002': 'Muzaffarpur', '842003': 'Muzaffarpur',
  '823001': 'Gaya', '823002': 'Gaya', '823003': 'Gaya',
  '812001': 'Bhagalpur', '812002': 'Bhagalpur', '812003': 'Bhagalpur',
  '844101': 'Hajipur', '844102': 'Hajipur',

  // ── JHARKHAND ─────────────────────────────────────────────────────────────
  '834001': 'Ranchi', '834002': 'Ranchi', '834003': 'Ranchi', '834004': 'Ranchi',
  '834005': 'Ranchi', '834006': 'Ranchi', '834007': 'Ranchi', '834008': 'Ranchi',
  '834009': 'Ranchi',
  '831001': 'Jamshedpur', '831002': 'Jamshedpur', '831003': 'Jamshedpur', '831004': 'Jamshedpur',
  '831005': 'Jamshedpur', '831006': 'Jamshedpur', '831007': 'Jamshedpur',
  '826001': 'Dhanbad', '826002': 'Dhanbad', '826003': 'Dhanbad', '826004': 'Dhanbad',
  '826005': 'Dhanbad',

  // ── ODISHA ────────────────────────────────────────────────────────────────
  '751001': 'Bhubaneswar', '751002': 'Bhubaneswar', '751003': 'Bhubaneswar', '751004': 'Bhubaneswar',
  '751005': 'Bhubaneswar', '751006': 'Bhubaneswar', '751007': 'Bhubaneswar', '751008': 'Bhubaneswar',
  '751009': 'Bhubaneswar', '751010': 'Bhubaneswar', '751011': 'Bhubaneswar', '751012': 'Bhubaneswar',
  '751013': 'Bhubaneswar', '751014': 'Bhubaneswar', '751015': 'Bhubaneswar', '751016': 'Bhubaneswar',
  '751017': 'Bhubaneswar', '751018': 'Bhubaneswar', '751019': 'Bhubaneswar', '751020': 'Bhubaneswar',
  '751021': 'Bhubaneswar', '751022': 'Bhubaneswar', '751023': 'Bhubaneswar', '751024': 'Bhubaneswar',
  '751025': 'Bhubaneswar', '751026': 'Bhubaneswar', '751027': 'Bhubaneswar', '751028': 'Bhubaneswar',
  '751029': 'Bhubaneswar', '751030': 'Bhubaneswar',
  '753001': 'Cuttack', '753002': 'Cuttack', '753003': 'Cuttack', '753004': 'Cuttack',
  '753007': 'Cuttack', '753008': 'Cuttack', '753009': 'Cuttack', '753010': 'Cuttack',
  '753012': 'Cuttack', '753013': 'Cuttack', '753014': 'Cuttack',
  '769001': 'Rourkela', '769002': 'Rourkela', '769003': 'Rourkela', '769004': 'Rourkela',
  '769005': 'Rourkela', '769006': 'Rourkela', '769007': 'Rourkela',
  '760001': 'Berhampur', '760002': 'Berhampur', '760003': 'Berhampur', '760004': 'Berhampur',

  // ── CHHATTISGARH ──────────────────────────────────────────────────────────
  '492001': 'Raipur', '492002': 'Raipur', '492003': 'Raipur', '492004': 'Raipur',
  '492005': 'Raipur', '492006': 'Raipur', '492007': 'Raipur', '492008': 'Raipur',
  '492009': 'Raipur', '492010': 'Raipur', '492012': 'Raipur', '492013': 'Raipur',
  '492014': 'Raipur', '492015': 'Raipur',
  '490001': 'Bhilai', '490002': 'Bhilai', '490003': 'Bhilai', '490004': 'Bhilai',
  '490005': 'Bhilai', '490006': 'Bhilai',
  '495001': 'Bilaspur', '495002': 'Bilaspur', '495003': 'Bilaspur', '495004': 'Bilaspur',

  // ── ASSAM ─────────────────────────────────────────────────────────────────
  '781001': 'Guwahati', '781002': 'Guwahati', '781003': 'Guwahati', '781004': 'Guwahati',
  '781005': 'Guwahati', '781006': 'Guwahati', '781007': 'Guwahati', '781008': 'Guwahati',
  '781009': 'Guwahati', '781010': 'Guwahati', '781011': 'Guwahati', '781012': 'Guwahati',
  '781013': 'Guwahati', '781014': 'Guwahati', '781015': 'Guwahati', '781016': 'Guwahati',
  '781017': 'Guwahati', '781018': 'Guwahati', '781019': 'Guwahati', '781020': 'Guwahati',
  '781021': 'Guwahati', '781022': 'Guwahati', '781023': 'Guwahati', '781024': 'Guwahati',
  '781025': 'Guwahati', '781026': 'Guwahati', '781027': 'Guwahati', '781028': 'Guwahati',
  '781029': 'Guwahati', '781030': 'Guwahati', '781031': 'Guwahati', '781032': 'Guwahati',
  '781035': 'Guwahati', '781036': 'Guwahati', '781037': 'Guwahati', '781038': 'Guwahati',
  '781040': 'Guwahati',
  '788001': 'Silchar', '788002': 'Silchar', '788003': 'Silchar', '788004': 'Silchar',
  '788005': 'Silchar',
  '785001': 'Jorhat', '785005': 'Jorhat', '785006': 'Jorhat',
  '782001': 'Nagaon', '782002': 'Nagaon', '782003': 'Nagaon',
  '784001': 'Tezpur', '784002': 'Tezpur',

  // ── KERALA ────────────────────────────────────────────────────────────────
  // Thiruvananthapuram
  '695001': 'Thiruvananthapuram', '695002': 'Thiruvananthapuram', '695003': 'Thiruvananthapuram',
  '695004': 'Thiruvananthapuram', '695005': 'Thiruvananthapuram', '695006': 'Thiruvananthapuram',
  '695007': 'Thiruvananthapuram', '695008': 'Thiruvananthapuram', '695009': 'Thiruvananthapuram',
  '695010': 'Thiruvananthapuram', '695011': 'Thiruvananthapuram', '695012': 'Thiruvananthapuram',
  '695013': 'Thiruvananthapuram', '695014': 'Thiruvananthapuram', '695015': 'Thiruvananthapuram',
  '695016': 'Thiruvananthapuram', '695017': 'Thiruvananthapuram', '695018': 'Thiruvananthapuram',
  '695019': 'Thiruvananthapuram', '695020': 'Thiruvananthapuram', '695021': 'Thiruvananthapuram',
  '695022': 'Thiruvananthapuram', '695023': 'Thiruvananthapuram', '695024': 'Thiruvananthapuram',
  '695025': 'Thiruvananthapuram', '695026': 'Thiruvananthapuram', '695027': 'Thiruvananthapuram',
  '695028': 'Thiruvananthapuram', '695032': 'Thiruvananthapuram', '695033': 'Thiruvananthapuram',
  '695034': 'Thiruvananthapuram', '695035': 'Thiruvananthapuram', '695036': 'Thiruvananthapuram',
  '695037': 'Thiruvananthapuram', '695038': 'Thiruvananthapuram', '695039': 'Thiruvananthapuram',
  '695040': 'Thiruvananthapuram', '695043': 'Thiruvananthapuram', '695099': 'Thiruvananthapuram',
  '695145': 'Thiruvananthapuram',
  // Kochi
  '682001': 'Kochi', '682002': 'Kochi', '682003': 'Kochi', '682004': 'Kochi',
  '682005': 'Kochi', '682006': 'Kochi', '682007': 'Kochi', '682008': 'Kochi',
  '682009': 'Kochi', '682010': 'Kochi', '682011': 'Kochi', '682012': 'Kochi',
  '682013': 'Kochi', '682014': 'Kochi', '682015': 'Kochi', '682016': 'Kochi',
  '682017': 'Kochi', '682018': 'Kochi', '682019': 'Kochi', '682020': 'Kochi',
  '682021': 'Kochi', '682022': 'Kochi', '682023': 'Kochi', '682024': 'Kochi',
  '682025': 'Kochi', '682026': 'Kochi', '682027': 'Kochi', '682028': 'Kochi',
  '682029': 'Kochi', '682030': 'Kochi', '682031': 'Kochi', '682032': 'Kochi',
  '682033': 'Kochi', '682034': 'Kochi', '682035': 'Kochi', '682036': 'Kochi',
  '682037': 'Kochi', '682038': 'Kochi', '682040': 'Kochi',
  // Kozhikode (Calicut)
  '673001': 'Kozhikode', '673002': 'Kozhikode', '673003': 'Kozhikode', '673004': 'Kozhikode',
  '673005': 'Kozhikode', '673006': 'Kozhikode', '673007': 'Kozhikode', '673008': 'Kozhikode',
  '673009': 'Kozhikode', '673010': 'Kozhikode', '673011': 'Kozhikode', '673012': 'Kozhikode',
  '673013': 'Kozhikode', '673014': 'Kozhikode', '673015': 'Kozhikode', '673016': 'Kozhikode',
  '673017': 'Kozhikode', '673018': 'Kozhikode', '673019': 'Kozhikode', '673020': 'Kozhikode',
  '673021': 'Kozhikode', '673032': 'Kozhikode',
  // Thrissur
  '680001': 'Thrissur', '680002': 'Thrissur', '680003': 'Thrissur', '680004': 'Thrissur',
  '680005': 'Thrissur', '680006': 'Thrissur', '680007': 'Thrissur', '680008': 'Thrissur',
  '680009': 'Thrissur', '680010': 'Thrissur', '680020': 'Thrissur', '680021': 'Thrissur',
  '680022': 'Thrissur',
  // Kollam
  '691001': 'Kollam', '691002': 'Kollam', '691003': 'Kollam', '691004': 'Kollam',
  '691005': 'Kollam', '691006': 'Kollam', '691007': 'Kollam', '691008': 'Kollam',
  '691009': 'Kollam', '691010': 'Kollam',
  // Malappuram
  '676101': 'Malappuram', '676102': 'Malappuram', '676103': 'Malappuram', '676104': 'Malappuram',
  '676505': 'Malappuram', '676506': 'Malappuram',
  // Palakkad
  '678001': 'Palakkad', '678002': 'Palakkad', '678003': 'Palakkad', '678004': 'Palakkad',
  '678006': 'Palakkad', '678007': 'Palakkad', '678008': 'Palakkad', '678009': 'Palakkad',
  '678010': 'Palakkad',

  // ── GOA ───────────────────────────────────────────────────────────────────
  '403001': 'Panaji', '403002': 'Panaji', '403004': 'Panaji',
  '403601': 'Margao', '403602': 'Margao', '403603': 'Margao',
  '403801': 'Vasco da Gama', '403802': 'Vasco da Gama',

  // ── JAMMU & KASHMIR ───────────────────────────────────────────────────────
  '190001': 'Srinagar', '190002': 'Srinagar', '190003': 'Srinagar', '190004': 'Srinagar',
  '190005': 'Srinagar', '190006': 'Srinagar', '190007': 'Srinagar', '190008': 'Srinagar',
  '190009': 'Srinagar', '190010': 'Srinagar', '190011': 'Srinagar', '190012': 'Srinagar',
  '190014': 'Srinagar', '190015': 'Srinagar', '190016': 'Srinagar', '190017': 'Srinagar',
  '190018': 'Srinagar', '190019': 'Srinagar', '190020': 'Srinagar', '190021': 'Srinagar',
  '190023': 'Srinagar', '190025': 'Srinagar',
  '180001': 'Jammu', '180002': 'Jammu', '180003': 'Jammu', '180004': 'Jammu',
  '180005': 'Jammu', '180006': 'Jammu', '180007': 'Jammu', '180009': 'Jammu',
  '180010': 'Jammu', '180011': 'Jammu', '180012': 'Jammu', '180013': 'Jammu',
  '180015': 'Jammu', '180016': 'Jammu', '180017': 'Jammu', '180018': 'Jammu',
  '180019': 'Jammu', '180020': 'Jammu',

  // ── NORTHEAST INDIA ───────────────────────────────────────────────────────
  '799001': 'Agartala', '799002': 'Agartala', '799003': 'Agartala', '799004': 'Agartala',
  '799005': 'Agartala', '799006': 'Agartala', '799007': 'Agartala',
  '795001': 'Imphal', '795002': 'Imphal', '795003': 'Imphal', '795004': 'Imphal',
  '795005': 'Imphal',
  '793001': 'Shillong', '793002': 'Shillong', '793003': 'Shillong', '793004': 'Shillong',
  '793005': 'Shillong', '793006': 'Shillong', '793007': 'Shillong', '793008': 'Shillong',
  '793009': 'Shillong', '793010': 'Shillong', '793011': 'Shillong', '793012': 'Shillong',
  '793014': 'Shillong', '793015': 'Shillong', '793016': 'Shillong', '793017': 'Shillong',
  '793018': 'Shillong', '793019': 'Shillong', '793021': 'Shillong', '793022': 'Shillong',
  '796001': 'Aizawl', '796002': 'Aizawl', '796003': 'Aizawl', '796004': 'Aizawl',
  '796005': 'Aizawl', '796007': 'Aizawl', '796009': 'Aizawl', '796010': 'Aizawl',
  '796012': 'Aizawl', '796014': 'Aizawl',
  '797001': 'Kohima', '797002': 'Kohima', '797003': 'Kohima', '797004': 'Kohima',
  '797005': 'Kohima',
  '791001': 'Itanagar', '791111': 'Itanagar', '791113': 'Itanagar',
  '737101': 'Gangtok', '737102': 'Gangtok', '737103': 'Gangtok', '737104': 'Gangtok',
  '737105': 'Gangtok', '737106': 'Gangtok', '737107': 'Gangtok',
  '737121': 'Namchi', '737126': 'Namchi',
  '744101': 'Port Blair', '744102': 'Port Blair', '744103': 'Port Blair',
  '744104': 'Port Blair', '744105': 'Port Blair', '744106': 'Port Blair',
  '786001': 'Dibrugarh', '786002': 'Dibrugarh', '786003': 'Dibrugarh',
  '783301': 'Goalpara',  '783371': 'Goalpara',

  // ── UTs ───────────────────────────────────────────────────────────────────
  '396210': 'Daman', '396215': 'Daman', '396220': 'Daman',
  '362520': 'Diu', '362530': 'Diu',
  '396191': 'Silvassa', '396193': 'Silvassa', '396195': 'Silvassa',
  '682555': 'Kavaratti',
};

export function lookupCityForPin(pin: string): string | null {
  return PIN_TO_CITY[pin] ?? null;
}

export interface InterestTag {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const INTERESTS: InterestTag[] = [
  // Safety & community
  { id: 'safety',       label: 'Safety & alerts',     Icon: Shield },
  { id: 'rwa',          label: 'RWA & polls',          Icon: Building2 },
  { id: 'neighbours',   label: 'Meet neighbours',      Icon: Users },
  { id: 'volunteers',   label: 'Volunteering',         Icon: HandHeart },
  { id: 'senior-care',  label: 'Senior care',          Icon: HeartHandshake },
  { id: 'women',        label: "Women's circle",       Icon: UserRound },
  // Kids & family
  { id: 'kids',         label: 'Kids & parenting',     Icon: Baby },
  { id: 'education',    label: 'Tuitions & classes',   Icon: GraduationCap },
  // Health & fitness
  { id: 'fitness',      label: 'Fitness',              Icon: Dumbbell },
  { id: 'health',       label: 'Health & clinics',     Icon: Stethoscope },
  // Food
  { id: 'food',         label: 'Food & tiffin',        Icon: Utensils },
  { id: 'homemade',     label: 'Homemade goods',       Icon: ChefHat },
  // Commerce & services
  { id: 'classifieds',  label: 'Buy & sell',           Icon: ShoppingBag },
  { id: 'deals',        label: 'Deals & discounts',    Icon: Tag },
  { id: 'group-buy',    label: 'Group buying',         Icon: ShoppingCart },
  { id: 'rentals',      label: 'Rentals & lending',    Icon: Key },
  { id: 'services',     label: 'Services & help',      Icon: Wrench },
  { id: 'jobs',         label: 'Local jobs & gigs',    Icon: Briefcase },
  // Lifestyle
  { id: 'pets',         label: 'Pets',                 Icon: Heart },
  { id: 'books',        label: 'Books & library',      Icon: BookOpen },
  { id: 'music',        label: 'Music & arts',         Icon: Music },
  { id: 'gaming',       label: 'Gaming',               Icon: Gamepad2 },
  { id: 'travel',       label: 'Travel & trips',       Icon: Plane },
  // Events & discovery
  { id: 'events',       label: 'Events & meetups',     Icon: Calendar },
  { id: 'lost-found',   label: 'Lost & found',         Icon: Search },
  { id: 'carpool',      label: 'Carpool',              Icon: Car },
  { id: 'news',         label: 'Local news',           Icon: Newspaper },
  // Environment
  { id: 'sustainability', label: 'Green living',       Icon: Leaf },
];
