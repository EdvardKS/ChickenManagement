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
        <img 
          src="/img/corporativa/svg/whatsapp.svg" 
          alt="Contactar por WhatsApp"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white p-2"
        />
      </motion.a>

      <motion.a 
        href="tel:+34654027015"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        transition={{ type: "spring", stiffness: 300 }}
      >
        <img 
          src="/img/corporativa/svg/telephone.svg" 
          alt="Llamar por teléfono"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white p-2"
        />
      </motion.a>
    </motion.div>
  );
}