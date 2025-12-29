
import { UnitData } from '../types';

export const CURRICULUM_UNITS: UnitData[] = [
  {
    id: "lib_s3",
    title: "Unit 3: The Radar",
    description: "Identifying and defusing substance-related triggers.",
    color: "indigo",
    requirements: { minXP: 0 },
    nodes: [
      {
        id: "l3-1",
        type: 'lesson',
        title: "The Association Loop",
        description: "How your brain creates triggers.",
        xpReward: 100,
        contentBlocks: [
          {
            id: "m3-1-1",
            type: "markdown",
            prompt: "Core Concept",
            content: "# Triggers are Associations\n\nYour brain connects people, places, and feelings to substance use. This isn't a moral failure; it's a neurological record. Identifying them is the first step to interrupting the loop.",
            feedback: { correct: "Ready to practice?", incorrect: "" },
            xpReward: 10
          },
          {
            id: "match_s3_01",
            type: "match_pairs",
            prompt: "Match each relapse cue with the best first-response tool.",
            content: {
              pairs: [
                { id: "p1", left: "Carrying cash after payday", right: "Hand money to a safe person" },
                { id: "p2", left: "Seeing an old using friend", right: "Exit + call support within 10m" },
                { id: "p3", left: "Boredom at night", right: "Pre-planned sober activity" },
                { id: "p4", left: "Sudden craving wave", right: "Urge surfing (10m timer)" }
              ]
            },
            feedback: {
              correct: "Good—fast pairing reduces relapse decisions.",
              incorrect: "Pick the tool that interrupts the chain quickest.",
              rationale: "Prompt identification allows for immediate interruption."
            },
            xpReward: 20,
            teaches: [{ framework: "RP", tag: "Trigger Identification" }]
          }
        ]
      },
      {
        id: "l3-media-pause",
        type: 'lesson',
        title: "Mastering the Pause",
        description: "Learn to surf the 90-second emotional wave using video and audio guides.",
        xpReward: 200,
        targetDimension: "Emotional",
        contentBlocks: [
          {
            id: "m3-p-1",
            type: 'markdown',
            prompt: "The 90-Second Rule",
            content: "# The 90-Second Rule\n\nNeuroanatomist Jill Bolte Taylor discovered that the chemical lifespan of an emotion in the body is only **90 seconds**.\n\nIf you stay angry or anxious for longer than that, it is because you are **re-triggering** the loop with your thoughts.",
            feedback: { correct: "Let's watch a real-world example.", incorrect: "" },
            xpReward: 10
          },
          {
            id: 'vid-pause-skit',
            type: 'video_segment',
            prompt: "Watch: The Trigger Loop",
            content: {
              mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
              posterUrl: "https://via.placeholder.com/640x360?text=The+Trigger+Loop",
              transcript: "In this skit, 'Michael' gets an unexpected text. Watch how his physical tension transforms into a mental narrative that drives a craving.",
              comprehensionQuestion: {
                text: "According to the skit, what actually keeps Michael's urge alive beyond the first minute?",
                options: [
                  { id: 'a', text: "The text notification sound", isCorrect: false },
                  { id: 'b', text: "The narrative (story) he tells himself", isCorrect: true },
                  { id: 'c', text: "A lack of hydration", isCorrect: false }
                ]
              }
            },
            feedback: { correct: "Insight locked. It's the story, not the sensation.", incorrect: "Watch closely: notice when Michael starts 'talking' to himself." },
            xpReward: 50
          },
          {
            id: 'aud-pause-guide',
            type: 'audio_segment',
            prompt: "Practice: The 90-Second Surf",
            content: {
              mediaUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav", 
              transcript: "Listen to this guided exercise. We will track a physical sensation as it rises, peaks, and naturally recedes."
            },
            feedback: { correct: "Regulated. You let the wave pass.", incorrect: "Try to listen all the way to the silence at the end." },
            xpReward: 50
          },
          {
            id: 'sc-pause-app',
            type: 'scenario_bridge',
            prompt: "Apply the Skill",
            content: {
              beats: {
                start: {
                  speaker: "npc",
                  text: "You are at a family dinner. Your uncle makes a passive-aggressive comment about your past. You feel the heat rise in your chest immediately.",
                  choices: [
                    { 
                      id: 'c1', 
                      label: "Snap back immediately ('Look who's talking.')", 
                      style: "attack",
                      nextBeatId: "end_risk",
                      consequenceText: "You reacted within the 90 seconds. The conflict escalates." 
                    },
                    { 
                      id: 'c2', 
                      label: "Excuse yourself to the bathroom for two minutes.", 
                      style: "regulated",
                      nextBeatId: "end_safe",
                      consequenceText: "You removed the fuel and let the chemical wave pass." 
                    }
                  ]
                },
                end_risk: { speaker: "system", text: "RISK: Reacting instantly traps you in the emotional loop. Practice the pause.", isEnd: true, score: 0 },
                end_safe: { speaker: "system", text: "SAFE: Success. By the time you return, your logic brain will be back online.", isEnd: true, score: 1 }
              },
              scoring: { passScoreAtLeast: 1 }
            },
            feedback: { correct: "Dignity preserved through the pause.", incorrect: "Remember the 90-second rule: space is your shield." },
            xpReward: 90
          }
        ]
      }
    ]
  },
  {
    id: "unit-wellness-101",
    title: "Unit 2: The Complex Simplicity of Wellness",
    description: "Beyond just 'physical health': exploring the 8 dimensions that make life worth living.",
    color: "emerald",
    requirements: { minXP: 0 },
    nodes: [
      {
        id: "node-w-1",
        type: 'lesson',
        title: "The 8 Dimensions",
        description: "Wellness is not just the absence of illness. It is a multi-dimensional balance.",
        xpReward: 150,
        targetDimension: "Intellectual",
        contentBlocks: [
          {
            id: "node-w-1-seg-1",
            type: 'markdown',
            prompt: "Introduction",
            content: "# What is Wellness?\n\nFor people in recovery, wellness is not just the absence of disease or stress. It is the **presence of purpose**, joyful relationships, and a healthy living environment.\n\nWe use the **8 Dimensions of Wellness** to find balance. If one dimension is neglected, it can pull the others down.",
            feedback: { correct: "Let's explore the dimensions.", incorrect: "" },
            xpReward: 10
          },
          {
            id: 'fc-w-1',
            type: 'flash_card',
            prompt: "Learn the Dimensions",
            content: {
              front: "Emotional Wellness",
              back: "Coping effectively with life and creating satisfying relationships."
            },
            feedback: { correct: "Aligned.", incorrect: "Review again to anchor the definition." },
            xpReward: 20
          },
          {
            id: 'match-w-1',
            type: 'match_pairs',
            prompt: "Connect the Dimension to its Definition",
            content: {
              pairs: [
                { id: 'p1', left: "Occupational", right: "Satisfaction from one's work" },
                { id: 'p2', left: "Financial", right: "Satisfaction with current/future situations" },
                { id: 'p3', left: "Spiritual", right: "Expanding sense of purpose and meaning" },
                { id: 'p4', left: "Social", right: "Developing connection and belonging" }
              ]
            },
            feedback: { correct: "Connections clarified.", incorrect: "Some connections aren't quite right. Review the definitions." },
            xpReward: 40
          },
          {
            id: 'sort-w-1',
            type: 'concept_sort',
            prompt: "Categorize these recovery actions",
            content: {
              buckets: [
                { id: 'env', label: "Environmental" },
                { id: 'phys', label: "Physical" }
              ],
              items: [
                { id: 'i1', text: "Decluttering your apartment", bucketId: 'env' },
                { id: 'i2', text: "Getting 8 hours of sleep", bucketId: 'phys' },
                { id: 'i3', text: "Moving away from high-risk areas", bucketId: 'env' },
                { id: 'i4', text: "Reducing sugar intake", bucketId: 'phys' }
              ]
            },
            feedback: { correct: "Action map calibrated.", incorrect: "A few actions are misclassified. Think about 'Body' vs 'Space'." },
            xpReward: 50
          }
        ]
      },
      {
        id: "node-w-2",
        type: 'lesson',
        title: "The Mortality Gap",
        description: "Understanding the health risks we face and how to reverse them.",
        xpReward: 150,
        targetDimension: "Physical",
        contentBlocks: [
          {
            id: "node-w-2-seg-1",
            type: 'markdown',
            prompt: "The Reality Check",
            content: "# The Reality Check\n\nResearch from the NASMHPD study revealed a shocking statistic: People with severe mental health or substance use conditions die, on average, **25 years earlier** than the general population.\n\nBut here is the key: They don't die from 'mental illness.' They die from **preventable** medical conditions like heart disease, diabetes, and respiratory disease.",
            feedback: { correct: "Facing facts is the first step.", incorrect: "" },
            xpReward: 10
          },
          {
            id: 'mc-w-1',
            type: 'multiple_choice',
            prompt: "What is the primary cause of early mortality in this population?",
            content: {
              options: [
                { id: 'a', text: "Suicide and Overdose", isCorrect: false, explanation: "While tragic, these are not the leading causes of the 25-year gap." },
                { id: 'b', text: "Preventable Medical Conditions", isCorrect: true, explanation: "Correct. Heart disease, diabetes, and respiratory issues are the primary killers." },
                { id: 'c', text: "Genetic defects", isCorrect: false, explanation: "The study points to 'modifiable' risk factors like smoking and obesity." }
              ]
            },
            feedback: { correct: "Critical insight locked in.", incorrect: "Not quite. Look at the primary causes mentioned in the research." },
            xpReward: 30
          },
          {
            id: 'fg-w-1',
            type: 'fill_gap',
            prompt: "Identify the risk factors",
            content: {
              textWithPlaceholder: "Risks include {0} factors like smoking and obesity, and social factors like {1}.",
              placeholders: [
                { index: 0, options: ["modifiable", "genetic"], correctOptionIndex: 0 },
                { index: 1, options: ["isolation", "wealth"], correctOptionIndex: 0 }
              ]
            },
            feedback: { correct: "Risk map updated.", incorrect: "Think about what can be changed (modifiable) vs what is given." },
            xpReward: 40
          }
        ]
      },
      {
        id: "node-w-3",
        type: 'challenge',
        title: "Agents of Change",
        description: "How to spark motivation when you feel stuck.",
        xpReward: 200,
        targetDimension: "Emotional",
        contentBlocks: [
          {
            id: "node-w-3-seg-1",
            type: 'markdown',
            prompt: "Motivation",
            content: "# Dissatisfaction vs. Hope\n\nWe rarely change when things feel 'fine.' We change when we are dissatisfied. But dissatisfaction alone isn't enough—we need **Hope**.\n\nHope is not just a feeling. It is the belief that **you have real choices**.",
            feedback: { correct: "Ready to test your hope logic?", incorrect: "" },
            xpReward: 10
          },
          {
            id: 'sb-w-1',
            type: 'sentence_builder',
            prompt: "Reconstruct Dr. Groopman's definition of Hope:",
            content: {
              segments: ["Hope", "can", "arrive", "only", "when", "you", "recognize", "that", "there", "are", "real", "options"],
              correctOrder: ["Hope can arrive only when you recognize that there are real options"]
            },
            feedback: {
              correct: "Exactly. Hope requires the existence of a choice.",
              incorrect: "Focus on the connection between hope and having options."
            },
            xpReward: 60
          },
          {
            id: 'sc-w-1',
            type: 'scenario_bridge',
            prompt: "The Power of Choice",
            content: {
              beats: {
                start: {
                  speaker: "npc",
                  text: "You are supporting a peer who is refusing to eat or drink. They are paranoid and believe the food is tainted. What do you do?",
                  choices: [
                    { 
                      id: 'c1', 
                      label: "Tell them they have to drink or they will get sick.", 
                      style: "attack",
                      nextBeatId: "end_risk",
                      consequenceText: "This is 'Ordering' or 'Threatening' (Roadblocks 1 & 2)." 
                    },
                    { 
                      id: 'c2', 
                      label: "Bring two juices. Drink one yourself. Offer them the other.", 
                      style: "regulated",
                      nextBeatId: "end_safe",
                      consequenceText: "Modeling safety restores control and dignity." 
                    },
                    { 
                      id: 'c3', 
                      label: "Leave them alone until they are ready.", 
                      style: "avoid",
                      nextBeatId: "end_neutral",
                      consequenceText: "Respects autonomy, but misses connection." 
                    }
                  ]
                },
                end_risk: { speaker: "system", text: "RISK: Ordering usually increases resistance. Try modeling safety next time.", isEnd: true, score: 0 },
                end_safe: { speaker: "system", text: "SAFE: Perfect. Choice is the antidote to paranoia.", isEnd: true, score: 1 },
                end_neutral: { speaker: "system", text: "NEUTRAL: Safety preserved, but clinical growth was minimal.", isEnd: true, score: 1 }
              },
              scoring: { passScoreAtLeast: 1 }
            },
            feedback: { correct: "Agency restored.", incorrect: "Review the 'Roadblocks' concepts to find a better approach." },
            xpReward: 100
          }
        ]
      }
    ]
  },
  {
    id: "lib_s8",
    title: "Unit 8: Stress Response",
    description: "Managing pressure, frustration, and conflict.",
    color: "emerald",
    requirements: { minXP: 200 },
    nodes: [
      {
        id: "l8-1",
        type: 'lesson',
        title: "The Stress Compass",
        description: "Differentiating types of stress.",
        xpReward: 120,
        contentBlocks: [
          {
            id: "sort_s8_01",
            type: "concept_sort",
            prompt: "Sort each stressor into the best category.",
            content: {
              buckets: [
                { id: "b1", label: "Frustration (Blocked Goal)" },
                { id: "b2", label: "Pressure (Demand)" },
                { id: "b3", label: "Conflict (Collision)" }
              ],
              items: [
                { id: "i1", text: "No ID = No Job", bucketId: "b1" },
                { id: "i2", text: "Probation check-in tomorrow", bucketId: "b2" },
                { id: "i3", text: "Want to stay home vs. need food", bucketId: "b3" }
              ]
            },
            feedback: {
              correct: "Correct—naming the stressor helps you pick the right tool.",
              incorrect: "Look for: blocked goal vs demand vs competing goals."
            },
            xpReward: 25,
            teaches: [{ framework: "WELLNESS", tag: "Emotional" }]
          }
        ]
      }
    ]
  },
  {
    id: "lib_s4",
    title: "Unit 4: The Architect's Plan",
    description: "Proactive strategies for long-term sobriety.",
    color: "rose",
    requirements: { minXP: 500 },
    nodes: [
      {
        id: "l4-1",
        type: 'lesson',
        title: "If-Then Planning",
        description: "Hardening your resolve with logic.",
        xpReward: 150,
        contentBlocks: [
          {
            id: "fill_if_then_01",
            type: "fill_gap",
            prompt: "Lock in an if–then plan.",
            content: {
              textWithPlaceholder: "If I notice {0} in my thinking, then I will {1}.",
              placeholders: [
                {
                  index: 0,
                  options: ["romanticizing use", "skipping support", "hiding my feelings"],
                  correctOptionIndex: 0
                },
                {
                  index: 1,
                  options: ["tell someone within 24h", "wait it out alone", "test myself around triggers"],
                  correctOptionIndex: 0
                }
              ]
            },
            feedback: {
              correct: "Good—early action beats late regret.",
              incorrect: "Choose the option that increases honesty and support."
            },
            xpReward: 30,
            teaches: [{ framework: "BRAVING", tag: "Accountability" }]
          },
          {
            id: "scenario_invitation_01",
            type: "scenario_bridge",
            prompt: "The Encounter: A high-risk moment shows up. Choose your move.",
            content: {
              beats: {
                start: {
                  speaker: "npc",
                  text: "Hey—come ride with me real quick. We're just heading to the store.",
                  choices: [
                    { id: "c1", label: "No. I’m not doing that. Take care.", style: "firm", nextBeatId: "end_safe" },
                    { id: "c2", label: "Maybe… what are we doing?", style: "appease", nextBeatId: "end_risk" }
                  ]
                },
                end_safe: {
                  speaker: "system",
                  text: "SAFE RESOLUTION: You exited fast and protected your recovery.",
                  isEnd: true,
                  score: 1
                },
                end_risk: {
                  speaker: "system",
                  text: "UNSAFE RESOLUTION: That keeps the door open to relapse risk. Let’s tighten the boundary.",
                  isEnd: true,
                  score: 0
                }
              },
              scoring: { passScoreAtLeast: 1 }
            },
            feedback: {
              correct: "That’s a clean boundary—short, firm, no debate.",
              incorrect: "You don’t owe an explanation. Practice a shorter “no.”"
            },
            xpReward: 50,
            teaches: [{ framework: "BRAVE", tag: "Boundaries" }]
          }
        ]
      }
    ]
  }
];
