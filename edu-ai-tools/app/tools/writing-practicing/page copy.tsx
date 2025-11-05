// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Calculator, PenTool, RefreshCw } from "lucide-react"

// interface MathProblem {
//   id: number
//   question: string
//   answer: string
//   explanation?: string
// }

// const topics = [
//   { value: "arithmetic", label: "Arithmetic" },
//   { value: "algebra", label: "Algebra" },
//   { value: "geometry", label: "Geometry" },
//   { value: "fractions", label: "Fractions" },
//   { value: "decimals", label: "Decimals" },
//   { value: "percentages", label: "Percentages" },
//   { value: "word-problems", label: "Word Problems" },
// ]

// const questionTypes = [
//   { value: "multiple-choice", label: "Multiple Choice" },
//   { value: "fill-in-blank", label: "Fill in the Blank" },
//   { value: "true-false", label: "True/False" },
//   { value: "short-answer", label: "Short Answer" },
// ]

// const questionLevels = [
//   { value: "beginner", label: "Beginner" },
//   { value: "intermediate", label: "Intermediate" },
//   { value: "advanced", label: "Advanced" },
// ]

// const languages = [
//   { value: "english", label: "English" },
//   { value: "spanish", label: "Spanish" },
//   { value: "french", label: "French" },
//   { value: "german", label: "German" },
// ]

// export default function MathGeneratorPage() {
//   const [topic, setTopic] = useState("")
//   const [questionCount, setQuestionCount] = useState([5])
//   const [questionType, setQuestionType] = useState("")
//   const [questionLevel, setQuestionLevel] = useState("")
//   const [language, setLanguage] = useState("english")
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [problems, setProblems] = useState<MathProblem[]>([])

//   const generateProblems = async () => {
//     if (!topic || !questionType || !questionLevel) {
//       return
//     }

//     setIsGenerating(true)

//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     // Generate sample problems based on selections
//     const sampleProblems: MathProblem[] = []

//     for (let i = 0; i < questionCount[0]; i++) {
//       let problem: MathProblem

//       if (topic === "arithmetic") {
//         const num1 = Math.floor(Math.random() * 50) + 1
//         const num2 = Math.floor(Math.random() * 50) + 1
//         const operations = ["+", "-", "×", "÷"]
//         const op = operations[Math.floor(Math.random() * operations.length)]

//         let answer: number
//         let question: string

//         switch (op) {
//           case "+":
//             answer = num1 + num2
//             question = `${num1} + ${num2} = ?`
//             break
//           case "-":
//             answer = Math.abs(num1 - num2)
//             question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`
//             break
//           case "×":
//             answer = num1 * num2
//             question = `${num1} × ${num2} = ?`
//             break
//           case "÷":
//             const dividend = num1 * num2
//             answer = num1
//             question = `${dividend} ÷ ${num2} = ?`
//             break
//           default:
//             answer = num1 + num2
//             question = `${num1} + ${num2} = ?`
//         }

//         if (questionType === "multiple-choice") {
//           const wrongAnswers = [answer + 1, answer - 1, answer + 2].filter((a) => a !== answer)
//           problem = {
//             id: i + 1,
//             question: `${question}\n\nA) ${answer}\nB) ${wrongAnswers[0]}\nC) ${wrongAnswers[1]}\nD) ${wrongAnswers[2]}`,
//             answer: `A) ${answer}`,
//             explanation: `The correct calculation gives us ${answer}.`,
//           }
//         } else {
//           problem = {
//             id: i + 1,
//             question,
//             answer: answer.toString(),
//             explanation: `Step-by-step: ${question.replace("?", answer.toString())}`,
//           }
//         }
//       } else if (topic === "algebra") {
//         const coefficient = Math.floor(Math.random() * 10) + 1
//         const constant = Math.floor(Math.random() * 20) + 1
//         const result = Math.floor(Math.random() * 15) + 1
//         const x = Math.floor((result - constant) / coefficient)

//         problem = {
//           id: i + 1,
//           question: `Solve for x: ${coefficient}x + ${constant} = ${result}`,
//           answer: `x = ${x}`,
//           explanation: `${coefficient}x = ${result} - ${constant} = ${result - constant}, so x = ${x}`,
//         }
//       } else {
//         // Default fallback
//         problem = {
//           id: i + 1,
//           question: `Sample ${topic} problem ${i + 1}`,
//           answer: "Sample answer",
//           explanation: "This is a sample explanation.",
//         }
//       }

//       sampleProblems.push(problem)
//     }

//     setProblems(sampleProblems)
//     setIsGenerating(false)
//   }

//   const canGenerate = topic && questionType && questionLevel

//   return (
//     <div className="p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="p-2 bg-primary/10 rounded-lg">
//             <PenTool className="h-6 w-6 text-primary" />
//           </div>
//           <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Writing Practicing Area</h1>
//         </div>
//         <p className="text-lg text-muted-foreground">
//           Generate custom math problems tailored to your learning needs. Select your preferences and get instant
//           practice problems.
//         </p>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Left Side - Form Controls */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Problem Settings</CardTitle>
//               <CardDescription>Customize your math problems by selecting the options below</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Topic Selection */}
//               <div className="space-y-2">
//                 <Label htmlFor="topic">Topic</Label>
//                 <Select value={topic} onValueChange={setTopic}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a math topic" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {topics.map((t) => (
//                       <SelectItem key={t.value} value={t.value}>
//                         {t.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Number of Questions */}
//               <div className="space-y-3">
//                 <Label>Number of Questions: {questionCount[0]}</Label>
//                 <Slider
//                   value={questionCount}
//                   onValueChange={setQuestionCount}
//                   max={20}
//                   min={1}
//                   step={1}
//                   className="w-full"
//                 />
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <span>1</span>
//                   <span>20</span>
//                 </div>
//               </div>

//               {/* Question Type */}
//               <div className="space-y-2">
//                 <Label htmlFor="question-type">Question Type</Label>
//                 <Select value={questionType} onValueChange={setQuestionType}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select question format" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {questionTypes.map((type) => (
//                       <SelectItem key={type.value} value={type.value}>
//                         {type.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Question Level */}
//               <div className="space-y-2">
//                 <Label htmlFor="question-level">Difficulty Level</Label>
//                 <Select value={questionLevel} onValueChange={setQuestionLevel}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select difficulty level" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {questionLevels.map((level) => (
//                       <SelectItem key={level.value} value={level.value}>
//                         {level.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Language */}
//               <div className="space-y-2">
//                 <Label htmlFor="language">Language</Label>
//                 <Select value={language} onValueChange={setLanguage}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select language" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {languages.map((lang) => (
//                       <SelectItem key={lang.value} value={lang.value}>
//                         {lang.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Generate Button */}
//               <Button onClick={generateProblems} disabled={!canGenerate || isGenerating} className="w-full" size="lg">
//                 {isGenerating ? (
//                   <>
//                     <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Calculator className="mr-2 h-4 w-4" />
//                     Generate Problems
//                   </>
//                 )}
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Side - Results Display */}
//         <div className="space-y-6">
//           <Card className="min-h-[600px]">
//             <CardHeader>
//               <CardTitle>Generated Problems</CardTitle>
//               <CardDescription>
//                 {problems.length > 0
//                   ? `${problems.length} problems generated`
//                   : "Your generated math problems will appear here"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {problems.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-96 text-center">
//                   <Calculator className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                   <h3 className="text-lg font-medium text-muted-foreground mb-2">No Problems Generated Yet</h3>
//                   <p className="text-sm text-muted-foreground max-w-sm">
//                     Fill out the form on the left and click "Generate Problems" to create custom math exercises.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {problems.map((problem) => (
//                     <div key={problem.id} className="border border-border rounded-lg p-4 space-y-3">
//                       <div className="flex items-start justify-between">
//                         <h4 className="font-medium text-foreground">Problem {problem.id}</h4>
//                         <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
//                           {questionLevel} • {topic}
//                         </span>
//                       </div>

//                       <div className="space-y-2">
//                         <div className="text-foreground whitespace-pre-line">{problem.question}</div>

//                         <details className="group">
//                           <summary className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium">
//                             Show Answer & Explanation
//                           </summary>
//                           <div className="mt-2 p-3 bg-muted/50 rounded border-l-4 border-primary space-y-2">
//                             <div className="font-medium text-foreground">Answer: {problem.answer}</div>
//                             {problem.explanation && (
//                               <div className="text-sm text-muted-foreground">{problem.explanation}</div>
//                             )}
//                           </div>
//                         </details>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
