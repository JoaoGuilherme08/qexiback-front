import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Wallet, ShoppingBag, Heart, TrendingUp, Users, Award } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Wallet,
      title: "Cashback Garantido",
      description: "Receba de volta parte do valor de suas compras em estabelecimentos parceiros.",
    },
    {
      icon: Heart,
      title: "Impacto Social",
      description: "Doe seu cashback para instituições sociais e transforme vidas.",
    },
    {
      icon: ShoppingBag,
      title: "Milhares de Ofertas",
      description: "Descubra produtos e serviços com os melhores percentuais de cashback.",
    },
    {
      icon: TrendingUp,
      title: "Acompanhe Seu Saldo",
      description: "Controle total sobre seus ganhos e doações em tempo real.",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Usuários Ativos" },
    { icon: Store, value: "500+", label: "Lojas Parceiras" },
    { icon: Heart, value: "R$ 1M+", label: "Doados" },
    { icon: Award, value: "50+", label: "Instituições" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom duration-700">
              Cashback que{" "}
              <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                Transforma Vidas
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
              Ganhe dinheiro de volta em suas compras e doe para causas sociais. 
              Consumo consciente com impacto real na sociedade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <Link to="/register">
                <Button size="lg" variant="hero-light" className="w-full sm:w-auto">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="hero-outline" className="w-full sm:w-auto">
                  Já Tenho Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simples, transparente e com impacto real
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-base border border-border"
              >
                <div className="w-14 h-14 gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para Fazer a Diferença?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Junte-se a milhares de pessoas que transformam suas compras em impacto social
            </p>
            <Link to="/register">
              <Button size="lg" variant="hero-light" className="shadow-medium">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Import missing icon
import { Store } from "lucide-react";

export default Index;
