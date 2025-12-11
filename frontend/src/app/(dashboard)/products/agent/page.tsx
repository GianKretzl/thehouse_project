"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, Package, TrendingUp, ShoppingCart, Sparkles, Shield, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { productsApi, type Product } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface Message {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: Date
  products?: Product[]
}

const quickSuggestions = [
  "Preciso de uma geladeira nova",
  "Quero comprar um celular bom e barato",
  "Estou procurando uma TV smart",
  "Notebook para trabalho remoto",
]

export default function ProductAgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carrega mensagem inicial do agente
  useEffect(() => {
    const loadInitialMessage = async () => {
      try {
        const response = await productsApi.getAgentInitialMessage()
        const initialMessage: Message = {
          id: "1",
          type: "agent",
          content: response.message,
          timestamp: new Date(),
        }
        setMessages([initialMessage])
      } catch (error) {
        console.error("Erro ao carregar mensagem inicial:", error)
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o chat. Tente recarregar a página.",
          variant: "destructive",
        })
        // Fallback message
        setMessages([{
          id: "1",
          type: "agent",
          content: "Olá! 👋 Sou seu Assistente de Compras inteligente. Estou aqui para ajudar você a encontrar os melhores produtos. O que você está procurando hoje?",
          timestamp: new Date(),
        }])
      } finally {
        setIsInitializing(false)
      }
    }
    loadInitialMessage()
  }, [])

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    if (!messageContent || isTyping) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setIsTyping(true)

    try {
      // Converte mensagens para o formato da API
      const apiMessages = newMessages.map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }))

      const response = await productsApi.chatWithAgent(apiMessages)

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: response.message,
        timestamp: new Date(),
        products: response.products,
      }

      setMessages([...newMessages, agentMessage])
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)
      toast({
        title: "Erro",
        description: error.detail || "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      })
      // Remove a mensagem do usuário em caso de erro
      setMessages(messages)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Iniciando o assistente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agente de Produtos IA</h1>
        <p className="text-muted-foreground">
          Seu assistente inteligente para encontrar os melhores produtos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Analisados
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+10k</div>
            <p className="text-xs text-muted-foreground">
              Em lojas verificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              Comparado ao preço médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recomendações
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">IA</div>
            <p className="text-xs text-muted-foreground">
              Powered by AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Converse com o Agente
          </CardTitle>
          <CardDescription>
            Descreva o que você procura e receba recomendações personalizadas de produtos seguros
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[calc(100vh-450px)] min-h-[500px] max-h-[700px]">
            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.type === "agent" && (
                      <Avatar className="h-8 w-8 border-2 border-primary flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] ${
                        message.type === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 sm:px-4 break-words ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>

                      {/* Product Cards */}
                      {message.products && message.products.length > 0 && (
                        <div className="flex flex-col gap-2 w-full">
                          {message.products.map((product) => (
                            <Card 
                              key={product.id} 
                              className={`w-full ${product.is_recommended ? 'border-yellow-400 border-2' : ''}`}
                            >
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                  {product.image ? (
                                    <div className="w-full sm:w-20 h-32 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                      <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full sm:w-20 h-32 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Package className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                      <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                        {product.name}
                                      </h4>
                                      {product.is_recommended && (
                                        <Badge variant="default" className="flex-shrink-0 bg-yellow-500 whitespace-nowrap">
                                          <Star className="h-3 w-3 mr-1 fill-white" />
                                          Recomendado
                                        </Badge>
                                      )}
                                    </div>
                                    {product.brand && (
                                      <p className="text-sm text-muted-foreground mt-1 truncate">
                                        {product.brand}
                                      </p>
                                    )}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
                                      <div className="flex flex-col">
                                        <span className="text-lg font-bold text-green-600">
                                          R$ {product.lowest_price.toFixed(2)}
                                        </span>
                                        {product.rating && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            {product.rating}
                                            {product.reviews && ` (${product.reviews})`}
                                          </div>
                                        )}
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        asChild
                                      >
                                        <a
                                          href={product.offers[0]?.product_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ShoppingCart className="h-3 w-3 mr-1" />
                                          Ver Produto
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {message.type === "user" && (
                      <Avatar className="h-8 w-8 border-2 border-muted flex-shrink-0">
                        <AvatarFallback className="bg-muted">
                          <span className="text-xs">Você</span>
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2 sm:gap-3 justify-start">
                    <Avatar className="h-8 w-8 border-2 border-primary flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-xs whitespace-normal h-auto py-2"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Descreva o produto que você procura..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="flex-shrink-0"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Sparkles className="h-5 w-5" />
            Inteligência Artificial a Seu Favor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p>
            Nosso agente usa inteligência artificial para entender suas necessidades e
            recomendar os melhores produtos. Todas as recomendações são de lojas verificadas
            pelo NetSaber, garantindo sua segurança em cada compra. Quanto mais você conversa,
            melhor o agente entende suas preferências!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
