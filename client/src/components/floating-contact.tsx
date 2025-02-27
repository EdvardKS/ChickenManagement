import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function FloatingContact() {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 }
  };

  return (
    <motion.div 
      className="fixed bottom-6 right-6 flex flex-col gap-4 z-50"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.a 
        href="https://wa.me/34654027015" 
        target="_blank" 
        rel="noopener noreferrer"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </motion.a>

      <motion.a 
        href="tel:+34654027015"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Phone className="h-7 w-7" />
        </Button>
      </motion.a>
    </motion.div>
  );
}