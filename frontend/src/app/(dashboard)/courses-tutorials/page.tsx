"use client"

import { useState } from "react"
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  Shield,
  Search,
  Lock,
  AlertTriangle,
  FileCheck,
  Eye,
  ShoppingBag,
  Smartphone,
  Globe,
  Heart,
  Users,
  MessageSquare,
  Video,
  Award,
  HelpCircle,
  MousePointer,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: number
  title: string
  description: string
  duration: string
  lessons: number
  category: "seguranca" | "compras" | "tecnologia" | "sistema"
  level: "Básico" | "Intermediário" | "Avançado"
  completed: boolean
  progress: number
  icon: React.ComponentType<{ className?: string }>
  type: "course" | "tutorial"
}

// Cursos de Segurança e Compras Online
const securityCourses: Course[] = [
  {
    id: 1,
    title: "Segurança Online para Iniciantes",
    description: "Aprenda os conceitos básicos de segurança na internet. Como identificar sites seguros, criar senhas fortes e proteger seus dados pessoais.",
    duration: "2h 30min",
    lessons: 8,
    category: "seguranca",
    level: "Básico",
    completed: true,
    progress: 100,
    icon: Shield,
    type: "course"
  },
  {
    id: 2,
    title: "Compras Online com Segurança",
    description: "Guia completo para fazer compras pela internet com tranquilidade. Aprenda a verificar lojas, comparar preços e evitar golpes.",
    duration: "3h 15min",
    lessons: 12,
    category: "compras",
    level: "Básico",
    completed: false,
    progress: 45,
    icon: ShoppingBag,
    type: "course"
  },
  {
    id: 3,
    title: "Como Identificar Golpes Comuns",
    description: "Conheça os golpes mais comuns na internet e aprenda a se proteger. Phishing, sites falsos, ofertas enganosas e muito mais.",
    duration: "1h 45min",
    lessons: 6,
    category: "seguranca",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: AlertTriangle,
    type: "course"
  },
  {
    id: 4,
    title: "Primeiros Passos no Mundo Digital",
    description: "Aprenda a usar o computador e internet com confiança. Navegação, e-mail, redes sociais e aplicativos básicos explicados de forma simples.",
    duration: "4h 00min",
    lessons: 15,
    category: "tecnologia",
    level: "Básico",
    completed: false,
    progress: 20,
    icon: Smartphone,
    type: "course"
  },
  {
    id: 5,
    title: "Redes Sociais com Segurança",
    description: "Como usar Facebook, WhatsApp e Instagram de forma segura. Configure privacidade, identifique mensagens falsas e proteja sua família.",
    duration: "2h 00min",
    lessons: 7,
    category: "tecnologia",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: MessageSquare,
    type: "course"
  },
  {
    id: 6,
    title: "Pagamentos Digitais Seguros",
    description: "Aprenda a usar Pix, cartões de crédito online e carteiras digitais com segurança. Entenda limites, autenticação e proteção contra fraudes.",
    duration: "1h 30min",
    lessons: 5,
    category: "compras",
    level: "Intermediário",
    completed: false,
    progress: 0,
    icon: Lock,
    type: "course"
  },
]

// Tutoriais do Sistema The House
const systemTutorials: Course[] = [
  {
    id: 7,
    title: "Como Usar o Portal do Aluno",
    description: "Aprenda a navegar pelo portal do aluno do The House. Entenda como verificar notas, frequência e conteúdo das aulas.",
    duration: "12 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: true,
    progress: 100,
    icon: Eye,
    type: "tutorial"
  },
  {
    id: 8,
    title: "Acompanhando seu Progresso",
    description: "Passo a passo de como acompanhar seu desenvolvimento no aprendizado de inglês através do portal.",
    duration: "8 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: true,
    progress: 100,
    icon: Search,
    type: "tutorial"
  },
  {
    id: 9,
    title: "Gerenciando Sites Confiáveis",
    description: "Como adicionar, remover e organizar sua lista de sites confiáveis. Marque favoritos e receba alertas personalizados.",
    duration: "10 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: CheckCircle,
    type: "tutorial"
  },
  {
    id: 10,
    title: "Usando o Chat de Suporte",
    description: "Como conversar com nossa equipe de suporte. Tire dúvidas, relate problemas e peça ajuda sempre que precisar.",
    duration: "6 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: MessageSquare,
    type: "tutorial"
  },
  {
    id: 11,
    title: "Configurando Notificações",
    description: "Personalize suas notificações de segurança. Escolha o que quer receber e como deseja ser alertado sobre ameaças.",
    duration: "7 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: Settings,
    type: "tutorial"
  },
  {
    id: 12,
    title: "Material Didático Online",
    description: "Como acessar e utilizar os materiais didáticos disponibilizados pelo The House através do portal.",
    duration: "9 min",
    lessons: 1,
    category: "sistema",
    level: "Básico",
    completed: false,
    progress: 0,
    icon: ShoppingBag,
    type: "tutorial"
  },
]

const allCourses = [...securityCourses, ...systemTutorials]

export default function CoursesAndTutorialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState<"all" | "courses" | "tutorials">("all")

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      selectedTab === "all" || 
      (selectedTab === "courses" && course.type === "course") ||
      (selectedTab === "tutorials" && course.type === "tutorial")
    
    return matchesSearch && matchesTab
  })

  const completedCount = allCourses.filter((c) => c.completed).length
  const totalLessons = allCourses.reduce((acc, c) => acc + c.lessons, 0)
  const avgProgress = Math.round(allCourses.reduce((acc, c) => acc + c.progress, 0) / allCourses.length)

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Básico: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      Intermediário: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      Avançado: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    }
    return colors[level] || colors.Básico
  }

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; color: string }> = {
      seguranca: { label: "Segurança", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      compras: { label: "Compras Online", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
      tecnologia: { label: "Tecnologia", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
      sistema: { label: "Sistema The House", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
    }
    return categories[category] || categories.seguranca
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cursos e Tutoriais</h1>
        <p className="text-muted-foreground">
          Aprenda sobre o sistema educacional e como usar o portal The House
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Seu Progresso
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Continue aprendendo!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{allCourses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              cursos e tutoriais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              aulas disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos e tutoriais..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <Video className="h-4 w-4 mr-2" />
                  Cursos
                </TabsTrigger>
                <TabsTrigger value="tutorials">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Tutoriais do Sistema
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      {/* Featured Banner for Seniors */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
              <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Feito Especialmente Para Você
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Todos os nossos cursos são desenvolvidos com linguagem clara e simples, 
                pensando em quem está começando no mundo digital. Vídeos pausáveis, 
                textos grandes e explicações detalhadas em cada passo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {filteredCourses.map((course) => {
          const Icon = course.icon
          const categoryInfo = getCategoryBadge(course.category)
          
          return (
            <Card
              key={course.id}
              className={`relative transition-all hover:shadow-lg ${
                course.completed ? "border-green-500/50" : ""
              }`}
            >
              {course.completed && (
                <div className="absolute right-3 top-3 z-10">
                  <div className="rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 border border-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={categoryInfo.color} variant="outline">
                        {categoryInfo.label}
                      </Badge>
                      <Badge className={getLevelColor(course.level)} variant="outline">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {course.description}
                </CardDescription>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} {course.lessons === 1 ? 'aula' : 'aulas'}</span>
                  </div>
                </div>

                {course.progress > 0 && course.progress < 100 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant={course.completed ? "outline" : "default"}
                  size="lg"
                >
                  {course.completed ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Revisar {course.type === "course" ? "Curso" : "Tutorial"}
                    </>
                  ) : course.progress > 0 ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Começar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-medium mb-2">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar com outras palavras ou veja todos os conteúdos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Users className="h-5 w-5" />
            Aprenda no Seu Ritmo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p className="mb-3">
            <strong>Cursos:</strong> Aprenda sobre segurança na internet, como fazer compras online 
            com confiança e navegue no mundo digital sem medo. Cada curso tem várias aulas 
            que você pode fazer quando quiser.
          </p>
          <p>
            <strong>Tutoriais do Sistema:</strong> Guias rápidos e práticos de como usar cada 
            funcionalidade do The House. Passo a passo simples para você aproveitar ao máximo 
            nossa plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
