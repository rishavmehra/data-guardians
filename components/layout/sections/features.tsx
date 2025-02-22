import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "TabletSmartphone",
    title: "Mobile Friendly",
    description:
      "Verify and manage your digital content protection seamlessly across all devices.(Comming soon...)",
  },
  {
    icon: "BadgeCheck",
    title: "Social Proof",
    description:
      "Build trust with verified content badges and public blockchain verification.",
  },
  {
    icon: "Goal",
    title: "Targeted Content",
    description:
      "Customize content protection strategies for different audience segments.",
  },
  {
    icon: "PictureInPicture",
    title: "Strong Visuals",
    description:
      "Protect your visual assets with watermarking and blockchain verification.",
  },
  {
    icon: "MousePointerClick",
    title: "Clear CTA",
    description:
      "Simple and intuitive actions to protect and verify your content.",
  },
  {
    icon: "Newspaper",
    title: "Clear Headline",
    description:
      "Easily communicate your content's authenticity and ownership.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        What Makes Us Different
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
      Our platform combines advanced blockchain technology with user-friendly features to provide the most comprehensive content protection solution.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
