
import { Resource, RecoveryTool } from '../types';

export const RESOURCES_DB: Resource[] = [
  {
    id: 1,
    name: "North Star Counseling",
    type: "Therapy Center",
    rating: 4.8,
    reviews: 124,
    address: "123 Main St, Springfield",
    tags: ["Insurance Accepted", "CBT", "Trauma-Informed"],
    verified: true,
    phone: "555-0101",
    description: "Comprehensive outpatient therapy specialized in trauma recovery."
  },
  {
    id: 10,
    name: "Sunrise Treatment Center",
    type: "Therapy Center",
    address: "6460 Harrison Ave, Cincinnati, OH 45247",
    tags: ["Medicaid Accepted", "MAT", "Outpatient"],
    verified: true,
    phone: "(513) 941-4999",
    website: "https://www.sunrisetreatmentcenter.net",
    description: "Substance abuse treatment program addressing underlying causes of addiction."
  },
  {
    id: 11,
    name: "Transitions Inc.",
    type: "Rehab Center",
    address: "700 Fairfield Ave, Bellevue, KY 41073",
    tags: ["Inpatient", "Outpatient", "Medicaid"],
    verified: true,
    phone: "(859) 491-4435",
    description: "Residential treatment and recovery housing services for Northern Kentucky."
  },
  {
    id: 12,
    name: "Ethan Health",
    type: "Therapy Center",
    address: "499 S 2nd St, Richmond, KY 40475",
    tags: ["Medicaid", "Commercial Insurance", "Outpatient"],
    verified: true,
    website: "https://ethanhealth.org",
    description: "Addiction treatment accepting most major insurance plans."
  },

  // --- Housing ---
  {
    id: 20,
    name: "Talbert House",
    type: "Housing",
    address: "2600 Victory Pkwy, Cincinnati, OH 45206",
    tags: ["Sober Living", "Case Management", "Men & Women"],
    verified: true,
    phone: "(513) 281-2273",
    description: "Offers recovery housing and supportive services for men and women."
  },
  {
    id: 21,
    name: "Bethany House Services",
    type: "Housing",
    address: "1841 Fairmount Ave, Cincinnati, OH 45214",
    tags: ["Family Shelter", "Women & Children"],
    verified: true,
    phone: "(513) 557-2873",
    description: "Emergency shelter and housing programs for families experiencing homelessness."
  },
  {
    id: 22,
    name: "New Foundations Recovery Housing",
    type: "Housing",
    address: "3400 Werk Rd, Cincinnati, OH 45211",
    tags: ["Recovery Housing", "Structured"],
    verified: true,
    website: "https://newfoundationsrecovery.org",
    description: "Safe, sober, supportive, and structured family atmosphere homes."
  },

  // --- Food & Basics ---
  {
    id: 30,
    name: "Freestore Foodbank",
    type: "Food Assistance",
    address: "1141 Central Pkwy, Cincinnati, OH 45202",
    tags: ["Pantry", "Clothing", "Social Services"],
    verified: true,
    phone: "(513) 482-4500",
    description: "Largest emergency food and services provider in Greater Cincinnati."
  },
  {
    id: 31,
    name: "Be Concerned (The People's Pantry)",
    type: "Food Assistance",
    address: "1100 W Pike St, Covington, KY 41011",
    tags: ["Choice Pantry", "Free"],
    verified: true,
    phone: "(859) 291-6789",
    description: "Free food pantry assisting NKY residents with basic necessities."
  },
  {
    id: 32,
    name: "Master Provisions",
    type: "Food Assistance",
    address: "7725 Foundation Dr, Florence, KY 41042",
    tags: ["Food Distribution", "Clothing"],
    verified: true,
    description: "Faith-based food bank partnering with local nonprofits."
  },

  // --- Legal Services ---
  {
    id: 40,
    name: "Legal Aid Society of Southwest Ohio",
    type: "Legal Services",
    address: "215 E 9th St, Cincinnati, OH 45202",
    tags: ["Free Legal Aid", "Civil Law"],
    verified: true,
    phone: "(513) 241-9400",
    description: "Legal assistance for low-income individuals in Southwest Ohio."
  },
  {
    id: 41,
    name: "Legal Aid of the Bluegrass",
    type: "Legal Services",
    address: "104 E 7th St, Covington, KY 41011",
    tags: ["Kentucky", "Free Legal Aid"],
    verified: true,
    phone: "(859) 431-8200",
    description: "Civil legal assistance to low-income residents of northern Kentucky."
  },

  // --- Wellness (Original) ---
  {
    id: 2,
    name: "Serenity Yoga",
    type: "Wellness",
    rating: 4.9,
    reviews: 85,
    address: "456 Oak Ave, Springfield",
    tags: ["Mindfulness", "Beginner Friendly"],
    verified: true,
    phone: "555-0202",
    description: "Trauma-sensitive yoga classes designed to help reconnect with the body."
  }
];

export const RAW_MEETINGS_CSV = `id,name,type,address,dayOfWeek,time,format,tags
1001,Sunday IP Meeting Group,NA,2900 Jefferson Avenue Cincinnati,Sunday,9:30 AM,NA,IP Study
1002,Droege House,meeting,925 5th Avenue Dayton,Sunday,10:00 AM,AA,Residential
1003,Joseph House,meeting,1619 Vine Street Cincinnati,Sunday,12:00 PM,AA,Veterans
1004,DeSota Bass Apartments,meeting,1801 Attucks Place Dayton,Sunday,12:00 PM,AA,Open
1005,Joseph House,meeting,1619 Vine Street Cincinnati,Sunday,2:00 PM,AA,Veterans
1006,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Sunday,3:00 PM,AA,Club
1007,Changing Lives Group,meeting,209 Ky Highway 36 West Williamstown,Sunday,3:00 PM,AA,Open
1008,First Baptist Church of Kennedy Heights,meeting,6201 Red Bank Road Cincinnati,Sunday,5:00 PM,AA,Church
1009,Eternal Joy MCC,meeting,2382 Kennedy Avenue Dayton,Sunday,5:00 PM,AA,Open
1010,Wesley Community Center,meeting,3730 Delphos Avenue Dayton,Sunday,6:00 PM,AA,Open
1011,Peace Lutheran Church,meeting,3530 Dayton Xenia Road Dayton,Sunday,6:00 PM,AA,Church
1012,Avondale Community Pride Center,meeting,3520 Burnet Avenue Cincinnati,Sunday,6:00 PM,AA,Community
1013,Tom Geiger House,meeting,2631 Gilbert Avenue Cincinnati,Sunday,6:30 PM,AA,Residential
1014,Fort Hamilton Hughes Hospital,meeting,630 Eaton Avenue Hamilton,Sunday,6:30 PM,AA,Hospital
1015,Christ Hospital,meeting,2139 Auburn Avenue Cincinnati,Sunday,6:30 PM,AA,Hospital
1016,Salvation Army,meeting,2250 Park Avenue Norwood,Sunday,7:00 PM,AA,Salvation Army
1017,Eggleston United Methodist Church,meeting,1961 Bullock Pen Road Taylor Mill,Sunday,7:00 PM,AA,Church
1018,Armco Union Hall,meeting,1100 Crawford Street Middletown,Sunday,7:30 PM,AA,Union Hall
1019,East of Eden Tattooing,meeting,105 Tahlequah Trail Springboro,Sunday,8:00 PM,NA,Alternative
1020,Ammons United Methodist Church,meeting,1301 East McMillan Street Cincinnati,Monday,9:00 AM,AA,Morning
1021,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Monday,10:00 AM,AA,Club
1022,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Monday,12:00 PM,AA,Hotel
1023,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Monday,12:00 PM,AA,Club
1024,Booker T. Washington Community Center,meeting,1140 South Front Street Hamilton,Monday,12:00 PM,AA,Community
1025,Luellan House,meeting,835 Glenwood Avenue Cincinnati,Monday,5:30 PM,AA,Residential
1026,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Monday,5:30 PM,AA,Club
1027,Trinity United Church of Christ,meeting,3850 East Galbraith Road Cincinnati,Monday,7:00 PM,AA,Church
1028,Trimble County Library,meeting,1124 East Highway 42 Bedford,Monday,7:00 PM,AA,Library
1029,Salvation Army,meeting,331 East Main Street Madison,Monday,7:00 PM,AA,Salvation Army
1030,Sabina Municipal Bldg.,meeting,101 N. Howard St. Sabina,Monday,7:00 PM,AA,Municipal
1031,Ninth Street Baptist Church,meeting,231 East 9th Street Covington,Monday,7:00 PM,AA,Church
1032,New Friendship Baptist Church,meeting,3212 Reading Road Cincinnati,Monday,7:00 PM,AA,Church
1033,Mount Moriah Baptist Church,meeting,1169 Simmons Avenue Cincinnati,Monday,7:00 PM,AA,Church
1034,Millvale Community Center,meeting,3301 Beekman Avenue Cincinnati,Monday,7:00 PM,AA,Community
1035,Life Line Community Church,meeting,571 Elberon Avenue Cincinnati,Monday,7:00 PM,AA,Church
1036,Korean Madisonville United Methodist Church,meeting,6130 Madison Road Cincinnati,Monday,7:00 PM,AA,Church
1037,First Presbyterian Church of Fairborn,meeting,1130 Highview Drive Fairborn,Monday,7:00 PM,AA,Church
1038,First Lutheran Church,meeting,138 West 1st Street Dayton,Monday,7:00 PM,AA,Church
1039,Clermont Mercy Hospital,meeting,3000 Hospital Drive Batavia,Monday,7:00 PM,AA,Hospital
1040,Centerville United Methodist Church,meeting,63 East Franklin Street Centerville,Monday,7:00 PM,AA,Church
1041,Hillsboro Church of Nazarene,meeting,8230 US Highway 50 Hillsboro,Monday,7:30 PM,AA,Church
1042,Hamilton Payne Chapel,meeting,320 South Front Street Hamilton,Monday,7:30 PM,AA,Chapel
1043,Dayton View Church,meeting,441 Holt Street Dayton,Monday,7:30 PM,AA,Church
1044,Hunter House Fellowship Hall,meeting,31 East 3rd Street Maysville,Monday,8:00 PM,AA,Fellowship
1045,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Monday,8:30 PM,AA,Hotel
1046,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Tuesday,12:00 PM,AA,Hotel
1047,First Baptist Church of Walnut Hills,meeting,2926 Park Avenue Cincinnati,Tuesday,4:30 PM,AA,Church
1048,Falmouth IOP,meeting,515 Pendleton Street Falmouth,Tuesday,5:00 PM,AA,IOP
1049,Luellan House,meeting,835 Glenwood Avenue Cincinnati,Tuesday,5:30 PM,AA,Residential
1050,Huntington Meadows Rental Office,meeting,1856 Langdon Farm Road Cincinnati,Tuesday,6:00 PM,AA,Rental Office
1051,YMCA,meeting,2840 Melrose Cincinnati,Tuesday,6:30 PM,AA,YMCA
1052,New Mission Baptist Church,meeting,4809 Ravenna Street Cincinnati,Tuesday,6:30 PM,AA,Church
1053,First Church of Christ,meeting,6080 Camp Ernst Road Burlington,Tuesday,7:00 PM,AA,Church
1054,Community Mental Health Center,meeting,427 West Eads Parkway Lawrenceburg,Tuesday,7:00 PM,AA,Mental Health
1055,Grace Episcopal Church,meeting,5501 Hamilton Avenue Cincinnati,Tuesday,7:30 PM,AA,Church
1056,First Presbyterian Church,meeting,23 South Front Street Hamilton,Tuesday,7:30 PM,AA,Church
1057,Calvary Baptist Church,meeting,2607 North Gettysburg Avenue Dayton,Tuesday,7:30 PM,AA,Church
1058,United Methodist Church,meeting,100 North Broad Street Fairborn,Tuesday,8:00 PM,AA,Church
1059,First United AME Church,meeting,286 East Church Street Xenia,Tuesday,8:00 PM,AA,Church
1060,Cynthiana Christian Church,meeting,202 North Main Street Cynthiana,Tuesday,8:00 PM,AA,Church
1061,Saint Joseph Church,meeting,745 Ezzard Charles Drive Cincinnati,Tuesday,8:30 PM,AA,Church
1062,Ammons United Methodist Church,meeting,1301 East McMillan Street Cincinnati,Wednesday,9:00 AM,AA,Morning
1063,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Wednesday,10:00 AM,AA,Club
1064,East of Eden Tattooing,meeting,105 Tahlequah Trail Springboro,Wednesday,11:00 AM,NA,Alternative
1065,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Wednesday,12:00 PM,AA,Hotel
1066,Elizabeth Place,meeting,1 Elizabeth Place Dayton,Wednesday,12:00 PM,AA,Open
1067,228 Club,meeting,228 South 6th Street Richmond,Wednesday,12:00 PM,AA,Club
1068,Our Daily Bread,meeting,1730 Race Street Cincinnati,Wednesday,1:00 PM,AA,Service
1069,Day-Mont-West,meeting,1520 Germantown Street Dayton,Wednesday,5:30 PM,AA,Open
1070,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Wednesday,6:00 PM,AA,Club
1071,Porter-Qualls Funeral Home,meeting,574 East Main Street Xenia,Wednesday,6:30 PM,AA,Funeral Home
1072,Correyville Recreation Center,meeting,2823 Eden Avenue Cincinnati,Wednesday,6:30 PM,AA,Rec Center
1073,Bush Center,meeting,Walnut Hills Cincinnati,Wednesday,6:30 PM,AA,Center
1074,Trinity United Church of Christ,meeting,3850 East Galbraith Road Cincinnati,Wednesday,7:00 PM,AA,Church
1075,Salvation Army,meeting,331 East Main Street Madison,Wednesday,7:00 PM,AA,Salvation Army
1076,New Beginnings Tabernacle,meeting,2561 Ramona Lane Fairfield,Wednesday,7:00 PM,AA,Church
1077,Morning Star Baptist Church,meeting,722 Oak Street Cincinnati,Wednesday,7:00 PM,AA,Church
1078,Housing Authority of Covington,meeting,2940 Madison Avenue Covington,Wednesday,7:00 PM,AA,Housing
1079,Booker T. Washington Community Center,meeting,1140 South Front Street Hamilton,Wednesday,7:00 PM,AA,Community
1080,Belmont United Church,meeting,2701 S. Smithville Road Dayton,Wednesday,7:00 PM,AA,Church
1081,Saint James Episcopal Church,meeting,3207 Montana Avenue Cincinnati,Wednesday,7:30 PM,AA,Church
1082,Queen of Martyrs Church,meeting,4200 North Dixie Drive Dayton,Wednesday,7:30 PM,AA,Church
1083,Saint Luke Treatment Center,meeting,512 South Maple Avenue Falmouth,Wednesday,8:00 PM,AA,Treatment
1084,Domiciliary,meeting,1000 South Fort Thomas Avenue Fort Thomas,Wednesday,8:00 PM,AA,Residential
1085,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Wednesday,8:00 PM,AA,Club
1086,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Wednesday,8:30 PM,AA,Hotel
1087,First United AME Church,meeting,286 East Church Street Xenia,Thursday,10:00 AM,AA,Church
1088,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Thursday,12:00 PM,AA,Hotel
1089,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Thursday,5:30 PM,AA,Hotel
1090,Dayton Correctional Center,meeting,4104 Germantown Pike Dayton,Thursday,6:00 PM,AA,Correctional
1091,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Thursday,6:00 PM,AA,Club
1092,Jacob Price Hall,meeting,1044 Greenup Street Covington,Thursday,7:00 PM,AA,Hall
1093,Grace Methodist Church,meeting,2221 Slane Avenue Norwood,Thursday,7:00 PM,AA,Church
1094,Clermont Mercy Hospital,meeting,3000 Hospital Drive Batavia,Thursday,7:00 PM,AA,Hospital
1095,Holy Trinity Church,meeting,19 1/2 East Walnut Street Oxford,Thursday,7:30 PM,AA,Church
1096,Holy Cross Lutheran Church,meeting,5071 Winton Road Fairfield,Thursday,7:30 PM,AA,Church
1097,Fairmont Presbyterian Church,meeting,3705 Far Hills Drive Dayton,Thursday,7:30 PM,AA,Church
1098,First Presbyterian Church,meeting,23 South Front Street Hamilton,Thursday,7:45 PM,AA,Church
1099,Saint Stephen Church,meeting,1627 Fairfax Avenue Cincinnati,Thursday,8:00 PM,AA,Church
1100,Holy Family Church,meeting,140 South Findlay Street Dayton,Thursday,8:00 PM,AA,Church
1101,Droege House,meeting,925 5th Avenue Dayton,Thursday,8:15 PM,AA,Residential
1102,Nast Trinity Church,meeting,1310 Race Street West Cincinnati,Thursday,8:30 PM,AA,Church
1103,Ammons United Methodist Church,meeting,1301 East McMillan Street Cincinnati,Friday,9:00 AM,AA,Morning
1104,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Friday,11:00 AM,AA,Club
1105,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Friday,12:00 PM,AA,Hotel
1106,Salvation Army,meeting,331 East Main Street Madison,Friday,7:00 PM,AA,Salvation Army
1107,Saint Columbkille Catholic Church,meeting,73 North Mulberry Street Wilmington,Friday,7:00 PM,AA,Church
1108,Pleasant Ridge Presbyterian Church,meeting,5950 Montgomery Road Cincinnati,Friday,7:00 PM,AA,Church
1109,Grace United Methodist Church,meeting,2836 Indiana Avenue Connersville,Friday,7:00 PM,AA,Church
1110,Booker T. Washington Community Center,meeting,1140 South Front Street Hamilton,Friday,7:00 PM,AA,Community
1111,Recovery Hotel,meeting,1225 Vine Street Cincinnati,Friday,7:30 PM,AA,Hotel
1112,McKinley United Methodist Church,meeting,196 Hawthorn Street Dayton,Friday,7:30 PM,AA,Church
1113,Hamilton Assembly of God,meeting,1940 West Elkton Road New Miami,Friday,7:30 PM,AA,Church
1114,Nast Trinity Church,meeting,1310 Race Street West Cincinnati,Friday,8:30 PM,AA,Church
1115,Holy Trinity Episcopal Church,meeting,7190 Euclid Avenue Cincinnati,Friday,8:30 PM,AA,Church
1116,Garden of Greenup Building,meeting,133 East 11th Street Covington,Friday,8:30 PM,AA,Building
1117,New Beginnings Tabernacle,meeting,2561 Ramona Lane Fairfield,Friday,10:00 PM,AA,Church
1118,New Hope Lutheran Church,meeting,2000 Catalpa Drive Dayton,Friday,11:59 PM,AA,Late Night
1119,Vineyard Church,meeting,1701 Princeton Pike Hamilton,Saturday,11:00 AM,AA,Church
1120,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Saturday,11:00 AM,AA,Club
1121,New Vision United Methodist Church,meeting,4400 Reading Road Cincinnati,Saturday,12:00 PM,AA,Church
1122,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Saturday,1:00 PM,AA,Club
1123,228 Club,meeting,228 South 6th Street Richmond,Saturday,1:30 PM,AA,Club
1124,Joseph House,meeting,1619 Vine Street Cincinnati,Saturday,3:00 PM,AA,Veterans
1125,Alano Center,meeting,1368 Central Avenue Middletown,Saturday,4:00 PM,AA,Club
1126,Saint Simon of Cyrene Episcopal Church,meeting,810 Matthews Drive Cincinnati,Saturday,6:00 PM,AA,Church
1127,New Hope Lutheran Church,meeting,2000 Catalpa Drive Dayton,Saturday,6:30 PM,AA,Church
1128,Trinity United Church of Christ,meeting,3850 East Galbraith Road Cincinnati,Saturday,7:00 PM,AA,Church
1129,Salvation Army,meeting,331 East Main Street Madison,Saturday,7:00 PM,AA,Salvation Army
1130,Project Cure,meeting,1800 North James H. McGee Boulevard Dayton,Saturday,7:00 PM,AA,Project Cure
1131,Good Shepherd Church,meeting,2661 Harshman Road Dayton,Saturday,7:00 PM,AA,Church
1132,Methodist Church,meeting,202 Winter Street Yellow Springs,Saturday,7:30 PM,AA,Church
1133,S.O.S. Hall,meeting,439 South 2nd Street Hamilton,Saturday,8:00 PM,AA,Hall
1134,First United AME Church,meeting,286 East Church Street Xenia,Saturday,8:00 PM,AA,Church
1135,Tom Geiger House,meeting,2631 Gilbert Avenue Cincinnati,Saturday,8:30 PM,AA,Residential
1136,Queen City Bridge Club,meeting,4813 Whetsel Avenue Cincinnati,Saturday,10:00 PM,AA,Club
1137,Holy Cross Lutheran Church,meeting,5071 Winton Road Fairfield,Saturday,10:00 PM,AA,Church
1138,Dayton Fellowship Club,meeting,1124 Germantown Street Dayton,Saturday,10:00 PM,AA,Club
`;

export const RECOVERY_TOOLS: Record<string, RecoveryTool> = {
  'anchor': {
    id: 'anchor',
    name: 'Ruby Slippers', 
    skill: 'Grounding',
    description: 'There is no place like here. Ground yourself in the present.',
    studyContent: 'When the Cyclone spins (panic/craving), click your heels. Feel your feet on the floor. Name 3 things you see. You have the power to return to safety.',
    icon: '👠',
    dimension: 'Emotional'
  },
  'shield': {
    id: 'shield',
    name: 'Lion’s Roar', 
    skill: 'Boundaries',
    description: 'Finding the courage to protect your energy.',
    studyContent: 'Courage is not the absence of fear, but acting in spite of it. Visualize a barrier between you and the Flying Monkeys (stressors). Say "No" to protect your peace.',
    icon: '🦁',
    dimension: 'Social'
  },
  'compass': {
    id: 'compass',
    name: 'Toto’s Instinct', 
    skill: 'Intuition',
    description: 'Trusting your gut when the path is foggy.',
    studyContent: 'Pull back the curtain on your motivations. Is this decision the "Great Wizard" (Ego) talking, or your true self? Trust your instinct.',
    icon: '🐕',
    dimension: 'Spiritual'
  },
  'key': {
    id: 'key',
    name: 'The Oil Can', 
    skill: 'Mobilization',
    description: 'Unfreezing from rust and stagnation.',
    studyContent: 'When depression rusts you in place, you need one drop of oil. Identify one tiny action (wash a dish, text a friend) to get moving.',
    icon: '🛢️',
    dimension: 'Occupational'
  },
  'level': {
    id: 'level',
    name: 'Scarecrow’s Diploma', 
    skill: 'Cognitive Reframing',
    description: 'You had the brain all along.',
    studyContent: 'Your brain isn\'t made of straw, it\'s just rewiring. Challenge the negative thought: Is it True? Is it Helpful? Is it Kind?',
    icon: '📜',
    dimension: 'Intellectual'
  },
  'crown': {
    id: 'crown',
    name: 'Emerald Glasses', 
    skill: 'Perspective',
    description: 'Seeing the world in a new light.',
    studyContent: 'Reframing the narrative from "Victim" to "Hero". How would you tell this chapter of your story to someone else?',
    icon: '👓',
    dimension: 'Intellectual'
  },
  'sos': {
    id: 'sos',
    name: 'Glinda’s Signal',
    skill: 'Help-Seeking',
    description: 'Summoning your support bubble.',
    studyContent: 'You do not have to fight the Wicked Witch alone. Asking for help is magic, not weakness.',
    icon: '✨',
    dimension: 'Social'
  },
  'mic': {
    id: 'mic',
    name: 'The Golden Mic',
    skill: 'Self-Expression',
    description: 'Speaking your truth without apology.',
    studyContent: 'Confidence is not screaming, it is being heard. Practice asserting your needs without guilt. Your voice matters.',
    icon: '🎤',
    dimension: 'Emotional'
  },
  'brick': {
    id: 'brick',
    name: 'The Gold Brick',
    skill: 'Resilience',
    description: 'Building a foundation that lasts.',
    studyContent: 'Each small win is a brick in your road. They cannot be taken away.',
    icon: '🧱',
    dimension: 'Physical'
  },
  'folder': {
    id: 'folder',
    name: 'The Blueprint',
    skill: 'Organization',
    description: 'Keeping your critical documents secure.',
    studyContent: 'Stability starts with identity. Knowing where your documents are gives you power over your civil life.',
    icon: '📂',
    dimension: 'Environmental'
  }
};
