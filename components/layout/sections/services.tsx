import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

enum ProService {
  YES = 1,
  NO = 0,
}
interface ServiceProps {
  title: string;
  pro: ProService;
  description: string;
}
const serviceList: ServiceProps[] = [
  {
    title: "1. Connect Your Wallet",
    description:
      "Start your journey by securely connecting your preferred Solana wallet - supporting Phantom, Sollet, and Solflare.",
    pro: 0,
  },
  {
    title: "2. Upload Your Creation",
    description:
      "Share your creative work - whether it's stunning visuals, captivating music, or compelling writing.",
    pro: 0,
  },
  {
    title: "3. Secure Your Rights",
    description: "Get instant proof of ownership with a unique cNFT that's permanently linked to your digital creation.",
    pro: 0,
  },
  {
    title: "4. Set Your Terms",
    description: "Take control of your content's future by defining clear usage rights and setting fair compensation terms.",
    pro: 0,
  },
  {
    title: "5. Protect Your Work",
    description: "Rest easy knowing your work is secured by blockchain technology and verifiable digital signatures.",
    pro: 0,
  },
  {
    title: "6. Earn & Grow",
    description: "Watch your success grow as you track usage, collect royalties, and build your creative business.",
    pro: 1,
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Working
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
      Your Journey Starts Here
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
      Straightforward steps to transform your creative work into protected, profitable digital assets
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-[60%] mx-auto">
        {serviceList.map(({ title, description, pro }) => (
          <Card
            key={title}
            className="bg-muted/60 dark:bg-card h-full relative"
          >
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <Badge
              data-pro={ProService.YES === pro}
              variant="secondary"
              className="absolute -top-2 -right-3 data-[pro=false]:hidden"
            >
              EARN
            </Badge>
          </Card>
        ))}
      </div>
    </section>
  );
};
