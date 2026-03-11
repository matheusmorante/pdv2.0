import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { ShoppingCart, Phone } from "lucide-react";

// Forcing dynamic rendering to always fetch fresh products
export const revalidate = 0;

interface Product {
  id: string;
  name: string;
  sku: string;
  sale_price: number;
  promotional_price: number | null;
  description: string;
  main_image_url: string | null;
  stock_quantity: number;
  status: string;
}

export default async function Home() {
  // Fetch active products
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("deleted", false)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar produtos:", error);
  }

  // Fallback items if database is empty
  const displayProducts: Product[] = products?.length ? products : [];

  const handleFormatPrice = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val || 0);
  };

  const getWhatsAppLink = (product: Product) => {
    const phoneNumber = "5541997493547";
    const text = `Olá! Tenho interesse no produto *${product.name}*.\n\nPreço: ${handleFormatPrice(product.promotional_price || product.sale_price)}\nSKU: ${product.sku || 'N/A'}\n\nPoderia me passar mais informações sobre prazo e disponibilidade de entrega?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200/60 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic group-hover:scale-105 transition-transform shadow-md shadow-blue-500/20">
              M
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">Móveis Morante</h1>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Design & Conforto</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#produtos" className="text-sm font-semibold hover:text-blue-600 transition-colors">Produtos</Link>
            <Link href="#categorias" className="text-sm font-semibold hover:text-blue-600 transition-colors">Categorias</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href="https://wa.me/5541997493547" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition-colors">
              <Phone size={16} />
              (41) 99749-3547
            </a>
            <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
              <ShoppingCart size={24} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 right-0 w-full h-full bg-gradient-to-r from-blue-50/50 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-widest rounded-full">
              Coleção 2026
            </div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-neutral-900">
              Conforto que <br />
              <span className="text-blue-600">Transforma</span> <br />
              Sua Casa.
            </h2>
            <p className="text-lg text-neutral-500 font-medium max-w-xl leading-relaxed">
              Descubra nossa linha de estofados premium e móveis exclusivos. Qualidade, design moderno e entrega garantida para você.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="#produtos" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
                Ver Coleção Completa
              </a>
              <a href="https://wa.me/5541997493547" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-900 font-bold rounded-2xl border border-neutral-200 shadow-sm transition-all hover:border-neutral-300">
                Falar com Consultor
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full transform scale-150 -translate-y-10" />
            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-neutral-100 rounded-[3rem] overflow-hidden border border-neutral-200/50 shadow-2xl">
               {/* Hero Placeholder Image */}
               <img 
                 src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200" 
                 alt="Móvel de Destaque" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent flex items-end p-8">
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl max-w-sm">
                     <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Destaque</p>
                     <p className="font-bold text-lg text-neutral-900 leading-tight">Sofá Retrátil Premium Verona</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section id="produtos" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-neutral-900 mb-3">Lançamentos e Destaques</h3>
              <p className="text-neutral-500 font-medium">Os produtos mais desejados com preços imbatíveis.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Filtrar por:</span>
              <select className="bg-white border border-neutral-200 text-sm font-semibold rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-colors">
                <option>Mais Novos</option>
                <option>Menor Preço</option>
                <option>Maior Preço</option>
              </select>
            </div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 border-dashed">
              <ShoppingCart size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-lg font-bold text-neutral-900">Nenhum produto cadastrado no momento.</p>
              <p className="text-neutral-500">Cadastre produtos no ERP para que apareçam aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden p-6 flex flex-col items-center justify-center">
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-3 group-hover:scale-105 transition-transform duration-500">
                        <ShoppingCart size={64} className="opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sem Foto</span>
                      </div>
                    )}

                    {product.promotional_price && (
                       <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                         Oferta
                       </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                        {product.sku ? `REF: ${product.sku}` : 'Cód. não info.'}
                      </p>
                      <h4 className="font-bold text-neutral-900 leading-tight line-clamp-2" title={product.name}>
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-auto">
                      <div className="mb-4">
                        {product.promotional_price ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-neutral-400 line-through font-medium">
                              {handleFormatPrice(product.sale_price)}
                            </span>
                            <span className="text-2xl font-black text-blue-600">
                              {handleFormatPrice(product.promotional_price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-neutral-900 block pt-5">
                            {handleFormatPrice(product.sale_price)}
                          </span>
                        )}
                      </div>

                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-neutral-900 group-hover:bg-blue-600 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors"
                      >
                        <ShoppingCart size={18} />
                        Comprar Agora
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-4 text-balance">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
               <h2 className="font-bold text-xl">Móveis Morante</h2>
            </div>
            <p className="text-neutral-400 text-sm max-w-md">
              A sua loja de confiança para entregar o melhor conforto e design para sua casa e família. Direto da fábrica para o seu lar.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Links Úteis</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href="#" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="#produtos" className="hover:text-white transition-colors">Produtos</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Phone size={14} /> (41) 99749-3547
              </li>
              <li>Seg - Sex, 08:00 às 18:00</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} Móveis Morante. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
