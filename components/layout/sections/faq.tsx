import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is DataGuardians?",
    answer: "DataGuardians is a platform that uses Web 3 digital signatures to verify the authenticity of digital content such as text, images, audio, and video. It helps combat deepfakes and misinformation by allowing creators to sign their work with their private key, which can be verified by anyone using the creator’s public address.",
    value: "item-1",
  },
  {
    question: "How does DataGuardians prevent deepfakes?",
    answer: "By requiring creators to digitally sign their content with their private key, DataGuardians ensures that any piece of media can be traced back to its original creator. This process makes it significantly harder for malicious actors to distribute altered or fake content without detection.",
    value: "item-2",
  },
  {
    question: "Do I need technical knowledge to use DataGuardians?",
    answer: "No, you don’t! DataGuardians automates the signing process so creators can focus on producing content. The system integrates seamlessly into existing workflows, making it easy for anyone to authenticate their work without needing advanced technical skills.",
    value: "item-3",
  },
  {
    question: "Can someone verify my content if they don’t know about blockchain?",
    answer: "Absolutely! Verification is simple and doesn’t require understanding blockchain technology. Anyone can check the authenticity of your content by comparing the signature against your public address, which can be shared via social media profiles or websites.",
    value: "item-4",
  },
  {
    question: "Is DataGuardians limited to specific types of content?",
    answer: "Not at all! DataGuardians supports all forms of digital content—whether it’s text, images, audio, or video. Additionally, we’re working on features that allow users to generate subsets of signed data (like clips from videos) without needing to re-sign them.",
    value: "item-5",
  },
];
export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Common Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
