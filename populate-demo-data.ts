import { getDb } from './server/db.js';
import { patients, appointments, tenants } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function populateDemoData() {
  console.log('🚀 Iniciando população de dados de demonstração...');

  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Banco de dados não disponível');
      return;
    }

    // Buscar tenant existente
    const existingTenants = await db.select().from(tenants).limit(1);
    let tenantId: number;

    if (existingTenants.length === 0) {
      console.log('📝 Criando tenant de demonstração...');
      const [tenant] = await db.insert(tenants).values({
        name: 'ORTOBOM ODONTOLOGÍA',
        subdomain: 'ortobom',
        maxUsers: 10,
        isActive: true,
      }).returning();
      tenantId = tenant.id;
    } else {
      tenantId = existingTenants[0].id;
      console.log(`✅ Usando tenant existente: ${tenantId}`);
    }

    // Verificar se já existem pacientes
    const existingPatients = await db.select().from(patients).where(eq(patients.tenantId, tenantId)).limit(1);
    
    if (existingPatients.length > 0) {
      console.log('ℹ️  Já existem pacientes no banco. Pulando população...');
      return;
    }

    console.log('📝 Criando 50 pacientes de demonstração...');

    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Laura', 'Pedro', 'Isabel'];
    const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];

    const patientsData = [];
    const appointmentsData = [];

    for (let i = 0; i < 50; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const hasActiveContract = i < 30; // 30 pacientes com contrato ativo
      const hasAppointment = i >= 15; // Apenas 15 pacientes SEM agendamento futuro

      const patient = {
        tenantId,
        firstName: nombre,
        lastName: `${apellido} ${i}`,
        phone: `+595 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
        whatsappNumber: `+595 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@example.com`,
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `Av. Principal ${i + 1}, La Paz`,
        city: 'La Paz',
        hasActiveContract,
        contractType: hasActiveContract ? 'Ortodoncia' : 'Ninguno',
        contractStartDate: hasActiveContract ? twoMonthsAgo : null,
        contractEndDate: hasActiveContract ? oneYearFromNow : null,
      };

      patientsData.push(patient);
    }

    // Inserir pacientes
    const insertedPatients = await db.insert(patients).values(patientsData).returning();
    console.log(`✅ ${insertedPatients.length} pacientes criados!`);

    // Criar agendamentos para alguns pacientes (deixando 15 sem agendamento)
    console.log('📅 Criando agendamentos...');
    
    for (let i = 15; i < insertedPatients.length; i++) {
      const patient = insertedPatients[i];
      const appointmentDate = new Date(now.getTime() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000);
      
      appointmentsData.push({
        tenantId,
        patientId: patient.id,
        title: 'Consulta de Control',
        start: appointmentDate,
        end: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hora depois
        status: 'scheduled',
        notes: 'Consulta de rutina',
      });
    }

    if (appointmentsData.length > 0) {
      await db.insert(appointments).values(appointmentsData);
      console.log(`✅ ${appointmentsData.length} agendamentos criados!`);
    }

    // Estatísticas finais
    const totalPatients = insertedPatients.length;
    const activeContracts = insertedPatients.filter(p => p.hasActiveContract).length;
    const withoutAppointments = 15;

    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`   Total de Pacientes: ${totalPatients}`);
    console.log(`   Contratos Ativos: ${activeContracts}`);
    console.log(`   Activos Sin Agendamiento: ${withoutAppointments}`);
    console.log(`   Com Agendamentos: ${appointmentsData.length}`);
    
    console.log('\n✅ População de dados concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    throw error;
  }
}

populateDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
