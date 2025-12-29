
import { LibraryBook } from '../types';

export const PRESET_BOOKS: LibraryBook[] = [
  {
    id: 'aa_big_book',
    title: 'Alcoholics Anonymous',
    author: 'Bill W.',
    coverEmoji: '📘',
    description: 'The Big Book. The basic text for Alcoholics Anonymous.',
    type: 'preset',
    progress: 0,
    isVerified: true,
    themeColor: 'bg-blue-600',
    uploadedAt: new Date().toISOString(),
    quizzesTaken: 0,
    masteryLevel: 0,
    chapters: [
      {
        id: 'aa_foreword',
        title: 'Foreword',
        content: `Foreword\n\nThis is the Foreword to the First Edition of the Big Book of Alcoholics Anonymous.\n\nWe, of Alcoholics Anonymous, are more than one hundred men and women who have recovered from a seemingly hopeless state of mind and body. To show other alcoholics precisely how we have recovered is the main purpose of this book. For them, we hope these pages will prove so convincing that no further authentication will be necessary. We think this account of our experiences will help everyone to better understand the alcoholic. Many do not comprehend that the alcoholic is a very sick person. And besides, we are sure that our way of living has its advantages for all.`
      },
      {
        id: 'aa_doc_opinion',
        title: "The Doctor's Opinion",
        content: `The Doctor's Opinion\n\nWE OF Alcoholics Anonymous believe that the reader will be interested in the medical estimate of the plan of recovery described in this book. Convincing testimony must surely come from medical men who have had experience with the sufferings of our members and have witnessed our return to health. A well-known doctor, chief physician at a nationally prominent hospital specializing in alcoholic and drug addiction, gave Alcoholics Anonymous this letter:\n\nTo Whom It May Concern:\n\nI have specialized in the treatment of alcoholism for many years. In late 1934 I attended a patient who, though he had been a competent businessman of good ability, was an alcoholic of a type I had come to regard as hopeless. In the course of his third treatment he acquired certain ideas concerning a possible means of recovery. As part of his rehabilitation he commenced to present his conceptions to other alcoholics, impressing upon them that they must do likewise with still others. This has become the basis of a rapidly growing fellowship of these men and their families.`
      },
      {
        id: 'aa_ch1',
        title: "Bill's Story",
        content: `Bill's Story\n\nWar fever ran high in the New England town to which we new, young officers from Plattsburg were assigned, and we were flattered when the first citizens took us to their homes, making us feel heroic. Here was love, applause, war; moments sublime with intervals hilarious. I was part of life at last, and in the midst of the excitement I discovered liquor. I forgot the strong warnings and the prejudices of my people concerning drink. In time we sailed for "Over There." I was very lonely and again turned to alcohol.\n\nWe landed in England. I visited Winchester Cathedral. Much moved, I wandered outside. My attention was caught by a doggerel on an old tombstone: "Here lies a Hampshire Grenadier / Who caught his death / Drinking cold small beer. / A good soldier is ne'er forgot / Whether he dieth by musket / Or by pot."`
      },
      {
        id: 'aa_ch2',
        title: "There Is A Solution",
        content: `There Is A Solution\n\nWe, of ALCOHOLICS ANONYMOUS, know thousands of men and women who were once just as hopeless as Bill. Nearly all have recovered. They have solved the drink problem.\n\nWe are average Americans. All sections of this country and many of its occupations are represented, as well as many political, economic, social, and religious backgrounds. We are people who normally would not mix. But there exists among us a fellowship, a friendliness, and an understanding which is indescribably wonderful.`
      },
      {
        id: 'aa_ch3',
        title: "More About Alcoholism",
        content: `More About Alcoholism\n\nMost of us have been unwilling to admit we were real alcoholics. No person likes to think he is bodily and mentally different from his fellows. Therefore, it is not surprising that our drinking careers have been characterized by countless vain attempts to prove we could drink like other people. The idea that somehow, someday he will control and enjoy his drinking is the great obsession of every abnormal drinker. The persistence of this illusion is astonishing. Many pursue it into the gates of insanity or death.`
      },
      {
        id: 'aa_ch4',
        title: "We Agnostics",
        content: `We Agnostics\n\nIn the preceding chapters you have learned something of alcoholism. We hope we have made clear the distinction between the alcoholic and the nonalcoholic. If, when you honestly want to, you find you cannot quit entirely, or if when drinking, you have little control over the amount you take, you are probably alcoholic. If that be the case, you may be suffering from an illness which only a spiritual experience will conquer.`
      },
      {
        id: 'aa_ch5',
        title: 'How It Works',
        content: `How It Works\n\nRarely have we seen a person fail who has thoroughly followed our path. Those who do not recover are people who cannot or will not completely give themselves to this simple program, usually men and women who are constitutionally incapable of being honest with themselves. There are such unfortunates. They are not at fault; they seem to have been born that way. They are naturally incapable of grasping and developing a manner of living which demands rigorous honesty. Their chances are less than average.\n\nThere are those, too, who suffer from grave emotional and mental disorders, but many of them do recover if they have the capacity to be honest.\n\nOur stories disclose in a general way what we used to be like, what happened, and what we are like now. If you have decided you want what we have and are willing to go to any length to get it-then you are ready to take certain steps.\n\nAt some of these we balked. We thought we could find an easier, softer way. But we could not. With all the earnestness at our command, we beg of you to be fearless and thorough from the very start. Some of us have tried to hold on to our old ideas and the result was nil until we let go absolutely.`
      },
      {
        id: 'aa_ch6',
        title: "Into Action",
        content: `Into Action\n\nHaving made our personal inventory, what shall we do about it? We have been trying to get a new attitude, a new relationship with our Creator, and to discover the obstacles in our path. We have admitted certain defects; we have ascertained in a rough way what the trouble is; we have put our finger on the weak items in our personal inventory. Now these are about to be cast out. This requires action on our part, which, when completed, will mean that we have admitted to God, to ourselves, and to another human being, the exact nature of our defects.`
      },
      {
        id: 'aa_ch7',
        title: "Working With Others",
        content: `Working With Others\n\nPractical experience shows that nothing will so much insure immunity from drinking as intensive work with other alcoholics. It works when other activities fail. This is our twelfth suggestion: Carry this message to other alcoholics! You can help when no one else can. You can secure their confidence when others fail. Remember they are very ill.`
      },
      {
        id: 'aa_ch8',
        title: "To Wives",
        content: `To Wives\n\nWith few exceptions, our book thus far has spoken of men. But what we have said applies quite as much to women. Our activities in behalf of women who drink are on the increase. There is every evidence that women regain their health as readily as men if they try our suggestions.\n\nBut for every man who drinks others are involved - the wife who trembles in fear of the next debauch; the mother and father who see their son wasting away.`
      },
      {
        id: 'aa_ch9',
        title: "The Family Afterward",
        content: `The Family Afterward\n\nOur women folk have suggested certain attitudes a wife may take with the husband who is recovering. Perhaps they created the impression that he is to be wrapped in cotton wool and placed on a pedestal. Successful adjustment means more than that. All members of the family should meet upon the common ground of tolerance, understanding and love.`
      },
      {
        id: 'aa_ch10',
        title: "To Employers",
        content: `To Employers\n\nAmong the contributors to this book are many men of affairs and employers of labor. Some of us have had to deal with alcoholics as employees. We have had to discharge many of them. We have often been mistaken in our judgment. We have sometimes tried to help the wrong man. We have often failed to help the man who could have been saved.`
      },
      {
        id: 'aa_ch11',
        title: "A Vision For You",
        content: `A Vision For You\n\nFor most normal folks, drinking means conviviality, companionship and colorful imagination. It means release from care, boredom and worry. It is joyous intimacy with friends and a feeling that life is good. But not so with us in those last days of heavy drinking. The old pleasures were gone. They were but memories. Never could we recapture the great moments of the past. There was an insistent yearning to enjoy life as we once did and a heartbreaking obsession that some new miracle of control would enable us to do it.`
      }
    ]
  },
  {
    id: 'na_basic',
    title: 'NA Basic Text',
    author: 'Narcotics Anonymous',
    coverEmoji: '🟦',
    description: 'The Basic Text of Narcotics Anonymous.',
    type: 'preset',
    progress: 0,
    isVerified: true,
    themeColor: 'bg-cyan-600',
    uploadedAt: new Date().toISOString(),
    quizzesTaken: 0,
    masteryLevel: 0,
    chapters: [
      {
        id: 'na_intro',
        title: 'Introduction & Overview',
        content: `Narcotics Anonymous is a nonprofit fellowship or society of men and women for whom drugs had become a major problem. We are recovering addicts who meet regularly to help each other stay clean. This is a program of complete abstinence from all drugs. There is only one requirement for membership, the desire to stop using. We suggest that you keep an open mind and give yourself a break. Our program is a set of principles written so simply that we can follow them in our daily lives. The most important thing about them is that they work.`
      },
      {
        id: 'na_who',
        title: 'Who Is an Addict?',
        content: `Most of us do not have to think twice about this question. We know! Our whole life and thinking was centered in drugs in one form or another—the getting and using and finding ways and means to get more. We lived to use and used to live. Very simply, an addict is a man or woman whose life is controlled by drugs. We are people in the grip of a continuing and progressive illness whose ends are always the same: jails, institutions, and death.`
      },
      {
        id: 'na_what',
        title: 'What Is the NA Program?',
        content: `NA is a nonprofit fellowship or society of men and women for whom drugs had become a major problem. We are recovering addicts who meet regularly to help each other stay clean. This is a program of complete abstinence from all drugs. There is only one requirement for membership, the desire to stop using. We suggest that you keep an open mind and give yourself a break. Our program is a set of principles written so simply that we can follow them in our daily lives. The most important thing about them is that they work.`
      },
      {
        id: 'na_why',
        title: 'Why Are We Here?',
        content: `Before coming to the Fellowship of NA, we could not manage our own lives. We could not live and enjoy life as other people do. We had to have something different and we thought we had found it in drugs. We placed their use ahead of the welfare of our families, our wives, husbands, and our children. We had to have drugs at all costs. We did many people great harm, but most of all we harmed ourselves. Through our inability to accept personal responsibilities we were actually creating our own problems. We seemed to be incapable of facing life on its own terms.`
      },
      {
        id: 'na_how',
        title: 'How It Works',
        content: `If you want what we have to offer, and are willing to make the effort to get it, then you are ready to take certain steps. These are the principles that made our recovery possible. \n\n1. We admitted that we were powerless over our addiction, that our lives had become unmanageable.\n2. We came to believe that a Power greater than ourselves could restore us to sanity.\n3. We made a decision to turn our will and our lives over to the care of God as we understood Him.\n\n... (The steps continue) ...\n\nThis is a spiritual, not religious program. Our steps are written in such a way that no matter what your background or beliefs, you can work them.`
      },
      {
        id: 'na_what_can',
        title: 'What Can I Do?',
        content: `Begin your own program by taking Step One from the previous chapter "How It Works." When we fully concede to our innermost selves that we are powerless over our addiction, we have taken a big step in our recovery. Many of us have had some reservations at this point, so give yourself a break and be as thorough as possible from the start. Go to step two, and so forth, and as you go on you will come to an understanding of the program for yourself.`
      },
      {
        id: 'na_traditions',
        title: 'The Twelve Traditions of NA',
        content: `We keep what we have only with vigilance, and just as freedom for the individual comes from the Twelve Steps, so freedom for the group springs from our Traditions.\n\n1. Our common welfare should come first; personal recovery depends on NA unity.\n2. For our group purpose there is but one ultimate authority—a loving God as He may express Himself in our group conscience. Our leaders are but trusted servants; they do not govern.\n\n... (The traditions continue) ...\n\nUnderstanding these traditions comes slowly over a period of time. We pick up information as we talk to members and visit various groups. It usually isn't until we get involved with service that someone points out that "personal recovery depends on NA unity," and that unity depends on how well we follow our Traditions.`
      },
      {
        id: 'na_relapse',
        title: 'Recovery and Relapse',
        content: `Many people think that recovery is simply a matter of not using drugs. They consider a relapse a sign of complete failure, and long periods of abstinence a sign of complete success. We in the recovery program of Narcotics Anonymous have found that this perception is too simplistic. After a member has had some involvement in our Fellowship, a relapse may be the jarring experience that brings about a more rigorous application of the program.`
      },
      {
        id: 'na_we_do',
        title: 'We Do Recover',
        content: `Although "Politics makes strange bedfellows," as the old saying goes, addiction makes us one of a kind. Our personal stories may vary in individual pattern but in the end we all have the same thing in common. This common illness or disorder is addiction. We know well the two things that make up true addiction: obsession and compulsion. Obsession—that fixed idea that takes us back time and time again to our particular drug, or some substitute, to recapture the ease and comfort we once knew.`
      },
      {
        id: 'na_just_today',
        title: 'Just for Today',
        content: `Tell yourself:\nJUST FOR TODAY my thoughts will be on my recovery, living and enjoying life without the use of drugs.\nJUST FOR TODAY I will have faith in someone in NA who believes in me and wants to help me in my recovery.\nJUST FOR TODAY I will have a program. I will try to follow it to the best of my ability.\nJUST FOR TODAY through NA I will try to get a better perspective on my life.\nJUST FOR TODAY I will be unafraid, my thoughts will be on my new associations, people who are not using and who have found a new way of life. So long as I follow that way, I have nothing to fear.`
      }
    ]
  },
  {
    id: 'bible_kjv',
    title: 'The Holy Bible',
    author: 'King James Version',
    coverEmoji: '✝️',
    description: 'The King James Version of the Holy Bible.',
    type: 'preset',
    progress: 0,
    isVerified: true,
    themeColor: 'bg-amber-700',
    uploadedAt: new Date().toISOString(),
    quizzesTaken: 0,
    masteryLevel: 0,
    chapters: [
      {
        id: 'gen',
        title: 'Genesis',
        content: `Genesis\n\n1:1 In the beginning God created the heaven and the earth.\n1:2 And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.\n1:3 And God said, Let there be light: and there was light.\n1:4 And God saw the light, that it was good: and God divided the light from the darkness.\n1:5 And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.\n\n... [Content truncated for brevity]`
      },
      {
        id: 'exo',
        title: 'Exodus',
        content: `Exodus\n\n1:1 Now these are the names of the children of Israel, which came into Egypt; every man and his household came with Jacob.\n1:2 Reuben, Simeon, Levi, and Judah,\n1:3 Issachar, Zebulun, and Benjamin,\n1:4 Dan, and Naphtali, Gad, and Asher.\n\n... [Content truncated for brevity]`
      },
      {
        id: 'psalm_23',
        title: 'Psalms',
        content: `Psalm 23\n\n1 The Lord is my shepherd; I shall not want.\n2 He maketh me to lie down in green pastures: he leadeth me beside the still waters.\n3 He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.\n4 Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.\n5 Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.\n6 Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`
      },
      {
        id: 'cor_13',
        title: '1 Corinthians 13',
        content: `1 Corinthians 13\n\n1 Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.\n2 And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am nothing.\n3 And though I bestow all my goods to feed the poor, and though I give my body to be burned, and have not charity, it profiteth me nothing.\n4 Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,\n5 Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;\n6 Rejoiceth not in iniquity, but rejoiceth in the truth;\n7 Beareth all things, believeth all things, hopeth all things, endureth all things.\n8 Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.`
      },
      {
        id: 'matthew',
        title: 'Matthew',
        content: `The Gospel According to Saint Matthew\n\n1:1 The book of the generation of Jesus Christ, the son of David, the son of Abraham.\n1:2 Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;\n\n... [Content truncated for brevity]`
      },
      {
        id: 'rev',
        title: 'Revelation',
        content: `The Revelation of Saint John the Divine\n\n1:1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John:\n1:2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw.\n1:3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand.\n\n... [Content truncated for brevity]`
      }
    ]
  }
];
