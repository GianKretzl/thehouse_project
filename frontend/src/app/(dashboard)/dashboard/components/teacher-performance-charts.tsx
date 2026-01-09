"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { classesApi, lessonsApi, assessmentsApi } from "@/lib/educational-api"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PerformanceData {
  weeklyAttendance: Array<{ day: string; registradas: number; esperadas: number }>
  contentByClass: Array<{ turma: string; conteudos: number; color: string }>
  assessmentsByType: Array<{ tipo: string; quantidade: number }>
  completionRate: number
  weeklyTrend: number
  insights: string[]
}

export function TeacherPerformanceCharts() {
  const { user } = useAuth()
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "TEACHER") {
      loadPerformanceData()
    }
  }, [user])

  const loadPerformanceData = async () => {
    try {
      const myClasses = await classesApi.list()
      
      if (myClasses.length === 0) {
        setData({
          weeklyAttendance: [],
          contentByClass: [],
          assessmentsByType: [],
          completionRate: 0,
          weeklyTrend: 0,
          insights: ["📚 Você ainda não tem turmas atribuídas. Entre em contato com a administração."],
        })
        return
      }
      
      // Dados da última semana
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

      // Inicializar dados da semana
      const weeklyAttendance = daysOfWeek.map(day => ({
        day: format(day, "EEE", { locale: ptBR }),
        registradas: 0,
        esperadas: 0,
      }))

      // Dados por turma
      const contentByClass: Array<{ turma: string; conteudos: number; color: string }> = []
      const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]
      
      let totalExpected = 0
      let totalRegistered = 0
      let totalAssessments = 0
      let lastWeekContent = 0

      for (let i = 0; i < myClasses.length; i++) {
        const cls = myClasses[i]
        
        try {
          const lessons = await lessonsApi.list(cls.id)
          const assessments = await assessmentsApi.list(cls.id)
          
          // Contar conteúdos desta semana
          const weekContent = lessons.filter(l => {
            const lessonDate = new Date(l.date)
            return lessonDate >= weekStart && lessonDate <= weekEnd && l.content
          }).length

          contentByClass.push({
            turma: cls.name,
            conteudos: weekContent,
            color: colors[i % colors.length]
          })

          // Contar aulas por dia da semana
          daysOfWeek.forEach((day, idx) => {
            const dayStr = format(day, "yyyy-MM-dd")
            const dayOfWeek = day.getDay()
            
            // Verificar quantas aulas eram esperadas neste dia
            const schedulesForDay = cls.schedules?.filter((s: any) => {
              const scheduleDay = s.weekday === 6 ? 0 : s.weekday + 1
              return scheduleDay === dayOfWeek
            }) || []
            
            weeklyAttendance[idx].esperadas += schedulesForDay.length

            // Verificar quantas foram registradas
            const registered = lessons.filter(l => l.date === dayStr).length
            weeklyAttendance[idx].registradas += registered

            if (day <= today) {
              totalExpected += schedulesForDay.length
              totalRegistered += registered
            }
          })

          totalAssessments += assessments.length

          // Semana anterior para comparação
          const prevWeekStart = subDays(weekStart, 7)
          const prevWeekEnd = subDays(weekEnd, 7)
          lastWeekContent += lessons.filter(l => {
            const lessonDate = new Date(l.date)
            return lessonDate >= prevWeekStart && lessonDate <= prevWeekEnd && l.content
          }).length

        } catch (error) {
          console.error(`[Performance] Erro ao carregar dados da turma ${cls.id}:`, error)
        }
      }

      console.log("[Performance] Totais:", {
        totalExpected,
        totalRegistered,
        totalAssessments,
        lastWeekContent
      })

      // Calcular taxa de conclusão
      const completionRate = totalExpected > 0 ? Math.round((totalRegistered / totalExpected) * 100) : 0
      
      // Calcular tendência semanal
      const currentWeekTotal = contentByClass.reduce((sum, c) => sum + c.conteudos, 0)
      const weeklyTrend = lastWeekContent > 0 
        ? Math.round(((currentWeekTotal - lastWeekContent) / lastWeekContent) * 100)
        : 0

      // Gerar insights automáticos
      const insights: string[] = []
      
      if (completionRate >= 90) {
        insights.push("🎯 Excelente trabalho! Seu diário está em dia e bem organizado.")
      } else if (completionRate >= 70) {
        insights.push("👍 Você está indo bem! Apenas algumas aulas pendentes de registro.")
      } else if (completionRate >= 50) {
        insights.push("⏰ Atenção! Reserve um tempo para atualizar seu diário de classe.")
      } else {
        insights.push("🚨 Urgente: Seu diário precisa de atenção. Priorize os registros pendentes.")
      }

      if (weeklyTrend > 20) {
        insights.push("🚀 Parabéns! Você dobrou seu ritmo de registros esta semana.")
      } else if (weeklyTrend > 0) {
        insights.push("📈 Boa! Você está melhorando em relação à semana anterior.")
      } else if (weeklyTrend < -20) {
        insights.push("🔄 Seu ritmo caiu bastante. Que tal retomar a consistência?")
      } else if (weeklyTrend < 0) {
        insights.push("⚡ Pequena queda no ritmo. Mantenha o foco!")
      }

      const bestClass = contentByClass.reduce((max, c) => c.conteudos > max.conteudos ? c : max, contentByClass[0])
      if (bestClass && bestClass.conteudos > 0 && contentByClass.length > 1) {
        insights.push(`🏆 Destaque da semana: turma "${bestClass.turma}" com ${bestClass.conteudos} conteúdo${bestClass.conteudos > 1 ? 's' : ''} aplicado${bestClass.conteudos > 1 ? 's' : ''}.`)
      }

      const classesWithoutContent = contentByClass.filter(c => c.conteudos === 0).length
      if (classesWithoutContent > 0 && myClasses.length > 1) {
        insights.push(`💭 ${classesWithoutContent} turma${classesWithoutContent > 1 ? 's' : ''} ainda sem conteúdo registrado esta semana.`)
      }

      if (totalAssessments === 0) {
        insights.push("📝 Dica: Crie avaliações para monitorar o progresso dos seus alunos.")
      } else if (totalAssessments < myClasses.length) {
        insights.push("📊 Que tal adicionar mais avaliações para uma análise completa?")
      } else {
        insights.push("✅ Ótimo controle de avaliações! Continue acompanhando seus alunos.")
      }

      // Dados de avaliações por tipo (simulado - você pode adaptar com dados reais)
      const assessmentsByType = [
        { tipo: "Provas", quantidade: Math.floor(totalAssessments * 0.4) || 0 },
        { tipo: "Trabalhos", quantidade: Math.floor(totalAssessments * 0.3) || 0 },
        { tipo: "Seminários", quantidade: Math.floor(totalAssessments * 0.2) || 0 },
        { tipo: "Outros", quantidade: Math.ceil(totalAssessments * 0.1) || 0 },
      ].filter(a => a.quantidade > 0)

      console.log("[Performance] Dados finais:", {
        weeklyAttendance,
        contentByClass,
        assessmentsByType,
        completionRate,
        weeklyTrend,
        insights: insights.length
      })

      setData({
        weeklyAttendance,
        contentByClass,
        assessmentsByType,
        completionRate,
        weeklyTrend,
        insights,
      })

    } catch (error) {
      console.error("Erro ao carregar dados de performance:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Card de Performance Principal */}
      <Card className="border-2 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sua Performance</CardTitle>
                <CardDescription className="text-base mt-1">
                  Resumo da semana atual
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={data.completionRate >= 90 ? "default" : data.completionRate >= 70 ? "secondary" : "destructive"}
              className="text-lg px-4 py-2 h-auto"
            >
              {data.completionRate >= 90 ? (
                <><CheckCircle2 className="h-5 w-5 mr-2" /> Excelente</>
              ) : data.completionRate >= 70 ? (
                <><AlertCircle className="h-5 w-5 mr-2" /> Bom</>
              ) : (
                <><AlertCircle className="h-5 w-5 mr-2" /> Atenção</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Taxa de Preenchimento */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-base font-semibold text-muted-foreground">
                Taxa de Preenchimento do Diário
              </span>
              <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {data.completionRate}%
              </span>
            </div>
            <div className="relative w-full bg-secondary/50 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out shadow-lg ${
                  data.completionRate >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                  data.completionRate >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${data.completionRate}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tendência Semanal */}
          {data.weeklyTrend !== 0 && (
            <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
              data.weeklyTrend > 0 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
            }`}>
              {data.weeklyTrend > 0 ? (
                <>
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 dark:text-green-100 font-semibold text-lg">
                      +{data.weeklyTrend}% esta semana
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Continue assim! Você está melhorando.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-900 dark:text-red-100 font-semibold text-lg">
                      {data.weeklyTrend}% esta semana
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      Tente manter a consistência.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Insights */}
          {data.insights.length > 0 && (
            <div className="space-y-3 pt-2">
              {data.insights.slice(0, 2).map((insight, idx) => {
                const emoji = Array.from(insight)[0]
                const text = insight.split(' ').slice(1).join(' ')
                return (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50 border">
                    <span className="text-xl mt-0.5">{emoji}</span>
                    <p className="text-sm font-medium text-foreground/90 flex-1">
                      {text}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/50">
          <TabsTrigger value="weekly" className="text-base data-[state=active]:bg-background data-[state=active]:shadow-md">
            📊 Frequências
          </TabsTrigger>
          <TabsTrigger value="classes" className="text-base data-[state=active]:bg-background data-[state=active]:shadow-md">
            📚 Conteúdo - Por Turma
          </TabsTrigger>
          <TabsTrigger value="assessments" className="text-base data-[state=active]:bg-background data-[state=active]:shadow-md">
            📝 Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 mt-6">
          <Card className="border-2 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Registro de Aulas - Esta Semana</CardTitle>
              <CardDescription className="text-base">
                Aulas esperadas vs. aulas registradas por dia
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <ChartContainer
                config={{
                  esperadas: {
                    label: "Esperadas",
                    color: "#94a3b8",
                  },
                  registradas: {
                    label: "Registradas",
                    color: "#3b82f6",
                  },
                }}
                className="h-[350px] w-full max-w-4xl mx-auto"
              >
                <AreaChart data={data.weeklyAttendance}>
                  <defs>
                    <linearGradient id="gradientEsperadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="gradientRegistradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '24px', fontSize: '15px', fontWeight: 600 }}
                    iconType="circle"
                  />
                  <Area 
                    type="monotone"
                    dataKey="esperadas" 
                    stroke="#94a3b8"
                    strokeWidth={3}
                    fill="url(#gradientEsperadas)"
                    dot={{ fill: '#94a3b8', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="registradas" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#gradientRegistradas)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4 mt-6">
          <Card className="border-2 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Conteúdos por Turma - Esta Semana</CardTitle>
              <CardDescription className="text-base">
                Total de conteúdos aplicados em cada turma
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              {data.contentByClass.length > 0 ? (
                <ChartContainer
                  config={{
                    conteudos: {
                      label: "Conteúdos",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px] w-full max-w-4xl mx-auto"
                >
                  <BarChart data={data.contentByClass} layout="vertical" margin={{ left: 20, right: 30, top: 20, bottom: 20 }}>
                    <defs>
                      {data.contentByClass.map((entry, index) => (
                        <linearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={entry.color} stopOpacity={1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.15} horizontal={false} />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      dataKey="turma" 
                      type="category" 
                      width={220}
                      tick={{ fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    />
                    <Bar 
                      dataKey="conteudos" 
                      radius={[0, 12, 12, 0]}
                      barSize={35}
                    >
                      {data.contentByClass.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="text-6xl opacity-20">📚</div>
                  <p className="text-lg font-medium">Nenhum conteúdo registrado esta semana</p>
                  <p className="text-sm">Comece a registrar suas aulas para ver os dados aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4 mt-6">
          <Card className="border-2 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Distribuição de Avaliações</CardTitle>
              <CardDescription className="text-base">
                Tipos de avaliações cadastradas por você
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              {data.assessmentsByType.length > 0 ? (
                <ChartContainer
                  config={{
                    quantidade: {
                      label: "Quantidade",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[350px] w-full max-w-3xl mx-auto"
                >
                  <PieChart>
                    <defs>
                      {data.assessmentsByType.map((entry, index) => {
                        const hue = (index * 80) % 360
                        return (
                          <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={`hsl(${hue}, 75%, 60%)`} stopOpacity={1}/>
                            <stop offset="100%" stopColor={`hsl(${hue}, 75%, 45%)`} stopOpacity={1}/>
                          </linearGradient>
                        )
                      })}
                    </defs>
                    <Pie
                      data={data.assessmentsByType}
                      dataKey="quantidade"
                      nameKey="tipo"
                      cx="50%"
                      cy="50%"
                      outerRadius={130}
                      innerRadius={70}
                      paddingAngle={4}
                      fill="hsl(var(--chart-1))"
                      label={(entry) => `${entry.tipo}: ${entry.quantidade}`}
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                    >
                      {data.assessmentsByType.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#pieGradient-${index})`}
                          stroke="hsl(var(--background))"
                          strokeWidth={4}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="text-6xl opacity-20">📝</div>
                  <p className="text-lg font-medium">Nenhuma avaliação cadastrada</p>
                  <p className="text-sm">Cadastre avaliações para acompanhar o desempenho dos alunos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
