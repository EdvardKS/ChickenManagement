import bcrypt from 'bcryptjs';

async function hashPassword() {
  // Generar un hash para la contraseña "edu123"
  const password = 'edu123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Contraseña original:', password);
  console.log('Contraseña hasheada:', hashedPassword);
  
  return hashedPassword;
}

hashPassword().then(hash => {
  console.log('\nSentencia SQL para insertar usuario:');
  console.log(`INSERT INTO users (username, password, role, name, email, active) VALUES ('edu', '${hash}', 'haykakan', 'Eduardo', 'edu@example.com', true);`);
});