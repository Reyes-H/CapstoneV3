// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { PenTool, RefreshCw, Lightbulb, CheckCircle } from "lucide-react"

// interface EssayAssistance {
//   topicSuggestions: string[]
//   outline: {
//     introduction: string
//     bodyParagraphs: string[]
//     conclusion: string
//   }
//   writingTips: string[]
//   grammarCheck: {
//     suggestions: string[]
//     score: number
//   }
// }

// const essayTypes = [
//   { value: "argumentative", label: "Argumentative" },
//   { value: "narrative", label: "Narrative" },
//   { value: "descriptive", label: "Descriptive" },
//   { value: "expository", label: "Expository" },
//   { value: "persuasive", label: "Persuasive" },
//   { value: "compare-contrast", label: "Compare & Contrast" },
// ]

// const academicLevels = [
//   { value: "middle-school", label: "Middle School" },
//   { value: "high-school", label: "High School" },
//   { value: "college", label: "College" },
//   { value: "graduate", label: "Graduate" },
// ]

// const writingStyles = [
//   { value: "formal", label: "Formal" },
//   { value: "informal", label: "Informal" },
//   { value: "academic", label: "Academic" },
//   { value: "creative", label: "Creative" },
// ]

// const lengthOptions = [
//   { value: "250", label: "250 words (1 page)" },
//   { value: "500", label: "500 words (2 pages)" },
//   { value: "750", label: "750 words (3 pages)" },
//   { value: "1000", label: "1000 words (4 pages)" },
//   { value: "1500", label: "1500 words (6 pages)" },
// ]

// export default function EssayHelperPage() {
//   const [essayType, setEssayType] = useState("")
//   const [topic, setTopic] = useState("")
//   const [length, setLength] = useState("")
//   const [academicLevel, setAcademicLevel] = useState("")
//   const [writingStyle, setWritingStyle] = useState("")
//   const [userText, setUserText] = useState("")
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [assistance, setAssistance] = useState<EssayAssistance | null>(null)
//   const [activeTab, setActiveTab] = useState("suggestions")

//   const generateAssistance = async () => {
//     if (!essayType || !academicLevel || !writingStyle) {
//       return
//     }

//     setIsGenerating(true)

//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     // Generate sample assistance based on selections
//     const sampleAssistance: EssayAssistance = {
//       topicSuggestions: [
//         `The impact of technology on ${academicLevel.replace("-", " ")} education`,
//         `${essayType.charAt(0).toUpperCase() + essayType.slice(1)} analysis of climate change effects`,
//         `Social media's influence on modern communication`,
//         `The role of artificial intelligence in future careers`,
//         `Cultural diversity in contemporary society`,
//       ],
//       outline: {
//         introduction: `Hook: Start with a compelling statistic or question about ${topic || "your chosen topic"}. Provide background context and end with a clear thesis statement that outlines your main argument.`,
//         bodyParagraphs: [
//           `First main point: Present your strongest argument with supporting evidence and examples.`,
//           `Second main point: Develop your second argument, ensuring it connects to your thesis.`,
//           `Third main point: Address counterarguments and refute them with solid reasoning.`,
//         ],
//         conclusion: `Restate your thesis in new words, summarize key points, and end with a call to action or thought-provoking statement.`,
//       },
//       writingTips: [
//         `Use ${writingStyle} language appropriate for ${academicLevel.replace("-", " ")} level`,
//         `Aim for approximately ${length || "500"} words with clear paragraph structure`,
//         `Include topic sentences at the beginning of each paragraph`,
//         `Use transition words to connect ideas smoothly`,
//         `Support arguments with credible sources and examples`,
//         `Proofread for grammar, spelling, and punctuation errors`,
//       ],
//       grammarCheck: {
//         suggestions: userText
//           ? [
//               "Consider varying sentence length for better flow",
//               "Check for passive voice usage",
//               "Ensure subject-verb agreement throughout",
//               "Review comma usage in complex sentences",
//             ]
//           : ["Paste your text to get grammar suggestions"],
//         score: userText ? Math.floor(Math.random() * 20) + 80 : 0,
//       },
//     }

//     setAssistance(sampleAssistance)
//     setIsGenerating(false)
//     setActiveTab("suggestions")
//   }

//   const canGenerate = essayType && academicLevel && writingStyle

//   return (
//     <div className="p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="p-2 bg-primary/10 rounded-lg">
//             <PenTool className="h-6 w-6 text-primary" />
//           </div>
//           <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Essay Helper</h1>
//         </div>
//         <p className="text-lg text-muted-foreground">
//           Get comprehensive assistance with your essay writing process, from brainstorming topics to final editing and
//           grammar checking.
//         </p>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Left Side - Form Controls */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Essay Settings</CardTitle>
//               <CardDescription>Configure your essay requirements to get personalized assistance</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Essay Type */}
//               <div className="space-y-2">
//                 <Label htmlFor="essay-type">Essay Type</Label>
//                 <Select value={essayType} onValueChange={setEssayType}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select essay type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {essayTypes.map((type) => (
//                       <SelectItem key={type.value} value={type.value}>
//                         {type.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Topic */}
//               <div className="space-y-2">
//                 <Label htmlFor="topic">Topic (Optional)</Label>
//                 <Input
//                   id="topic"
//                   placeholder="Enter your essay topic or leave blank for suggestions"
//                   value={topic}
//                   onChange={(e) => setTopic(e.target.value)}
//                 />
//               </div>

//               {/* Length */}
//               <div className="space-y-2">
//                 <Label htmlFor="length">Target Length</Label>
//                 <Select value={length} onValueChange={setLength}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select target length" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lengthOptions.map((option) => (
//                       <SelectItem key={option.value} value={option.value}>
//                         {option.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Academic Level */}
//               <div className="space-y-2">
//                 <Label htmlFor="academic-level">Academic Level</Label>
//                 <Select value={academicLevel} onValueChange={setAcademicLevel}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select academic level" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {academicLevels.map((level) => (
//                       <SelectItem key={level.value} value={level.value}>
//                         {level.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Writing Style */}
//               <div className="space-y-2">
//                 <Label htmlFor="writing-style">Writing Style</Label>
//                 <Select value={writingStyle} onValueChange={setWritingStyle}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select writing style" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {writingStyles.map((style) => (
//                       <SelectItem key={style.value} value={style.value}>
//                         {style.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Generate Button */}
//               <Button onClick={generateAssistance} disabled={!canGenerate || isGenerating} className="w-full" size="lg">
//                 {isGenerating ? (
//                   <>
//                     <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//                     Generating Assistance...
//                   </>
//                 ) : (
//                   <>
//                     <Lightbulb className="mr-2 h-4 w-4" />
//                     Get Essay Help
//                   </>
//                 )}
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Grammar Check Section */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Grammar Check</CardTitle>
//               <CardDescription>Paste your text below for grammar and style suggestions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <Textarea
//                   placeholder="Paste your essay text here for grammar checking..."
//                   value={userText}
//                   onChange={(e) => setUserText(e.target.value)}
//                   className="min-h-32"
//                 />
//                 <Button
//                   onClick={generateAssistance}
//                   variant="outline"
//                   className="w-full bg-transparent"
//                   disabled={!userText.trim() || isGenerating}
//                 >
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                   Check Grammar
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Side - Results Display */}
//         <div className="space-y-6">
//           <Card className="min-h-[700px]">
//             <CardHeader>
//               <CardTitle>Essay Assistance</CardTitle>
//               <CardDescription>
//                 {assistance ? "Your personalized essay help is ready" : "Your essay assistance will appear here"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {!assistance ? (
//                 <div className="flex flex-col items-center justify-center h-96 text-center">
//                   <PenTool className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                   <h3 className="text-lg font-medium text-muted-foreground mb-2">No Assistance Generated Yet</h3>
//                   <p className="text-sm text-muted-foreground max-w-sm">
//                     Fill out the essay settings and click "Get Essay Help" to receive personalized writing assistance.
//                   </p>
//                 </div>
//               ) : (
//                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                   <TabsList className="grid w-full grid-cols-4">
//                     <TabsTrigger value="suggestions">Topics</TabsTrigger>
//                     <TabsTrigger value="outline">Outline</TabsTrigger>
//                     <TabsTrigger value="tips">Tips</TabsTrigger>
//                     <TabsTrigger value="grammar">Grammar</TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="suggestions" className="space-y-4">
//                     <div>
//                       <h4 className="font-medium text-foreground mb-3">Topic Suggestions</h4>
//                       <div className="space-y-2">
//                         {assistance.topicSuggestions.map((suggestion, index) => (
//                           <div
//                             key={index}
//                             className="p-3 bg-muted/50 rounded border-l-4 border-primary cursor-pointer hover:bg-muted/70 transition-colors"
//                             onClick={() => setTopic(suggestion)}
//                           >
//                             <p className="text-sm text-foreground">{suggestion}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="outline" className="space-y-4">
//                     <div>
//                       <h4 className="font-medium text-foreground mb-3">Essay Outline</h4>
//                       <div className="space-y-4">
//                         <div className="p-4 bg-muted/50 rounded">
//                           <h5 className="font-medium text-primary mb-2">Introduction</h5>
//                           <p className="text-sm text-foreground">{assistance.outline.introduction}</p>
//                         </div>

//                         <div className="p-4 bg-muted/50 rounded">
//                           <h5 className="font-medium text-primary mb-2">Body Paragraphs</h5>
//                           <div className="space-y-2">
//                             {assistance.outline.bodyParagraphs.map((paragraph, index) => (
//                               <p key={index} className="text-sm text-foreground">
//                                 {paragraph}
//                               </p>
//                             ))}
//                           </div>
//                         </div>

//                         <div className="p-4 bg-muted/50 rounded">
//                           <h5 className="font-medium text-primary mb-2">Conclusion</h5>
//                           <p className="text-sm text-foreground">{assistance.outline.conclusion}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="tips" className="space-y-4">
//                     <div>
//                       <h4 className="font-medium text-foreground mb-3">Writing Tips</h4>
//                       <div className="space-y-2">
//                         {assistance.writingTips.map((tip, index) => (
//                           <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded">
//                             <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
//                             <p className="text-sm text-foreground">{tip}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </TabsContent>

//                   <TabsContent value="grammar" className="space-y-4">
//                     <div>
//                       <h4 className="font-medium text-foreground mb-3">Grammar Check Results</h4>
//                       {assistance.grammarCheck.score > 0 && (
//                         <div className="p-4 bg-muted/50 rounded mb-4">
//                           <div className="flex items-center justify-between mb-2">
//                             <span className="text-sm font-medium">Grammar Score</span>
//                             <span className="text-lg font-bold text-primary">{assistance.grammarCheck.score}/100</span>
//                           </div>
//                           <div className="w-full bg-muted rounded-full h-2">
//                             <div
//                               className="bg-primary h-2 rounded-full transition-all duration-300"
//                               style={{ width: `${assistance.grammarCheck.score}%` }}
//                             />
//                           </div>
//                         </div>
//                       )}
//                       <div className="space-y-2">
//                         {assistance.grammarCheck.suggestions.map((suggestion, index) => (
//                           <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded">
//                             <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
//                             <p className="text-sm text-foreground">{suggestion}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </TabsContent>
//                 </Tabs>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
