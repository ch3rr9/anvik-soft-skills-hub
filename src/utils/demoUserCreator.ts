
import { supabase } from "@/integrations/supabase/client";

// Функция для создания демо-пользователей с обходом RLS
export const createDemoUsers = async () => {
  try {
    console.log('Creating demo users...');
    
    // Пытаемся создать пользователей через админский клиент
    const demoUsers = [
      {
        id: 1000000001,
        name: "Александр Директоров",
        email: "director@anvik-soft.com",
        password: "director123",
        role: "director",
        department: "Руководство",
        position: "Генеральный директор",
        avatar_url: "https://i.pravatar.cc/150?u=director"
      },
      {
        id: 1000000002,
        name: "Елена Кадрова",
        email: "hr@anvik-soft.com",
        password: "hr123",
        role: "hr",
        department: "HR отдел",
        position: "HR менеджер",
        avatar_url: "https://i.pravatar.cc/150?u=hr"
      },
      {
        id: 1000000003,
        name: "Михаил Управленцев",
        email: "manager@anvik-soft.com",
        password: "manager123",
        role: "manager",
        department: "Отдел разработки",
        position: "Руководитель проектов",
        avatar_url: "https://i.pravatar.cc/150?u=manager"
      },
      {
        id: 1000000004,
        name: "Ирина Сотрудникова",
        email: "employee@anvik-soft.com",
        password: "employee123",
        role: "employee",
        department: "Отдел разработки",
        position: "Frontend разработчик",
        avatar_url: "https://i.pravatar.cc/150?u=employee"
      },
      {
        id: 1000000005,
        name: "Cherry",
        email: "cherry@anvik-soft.com",
        password: "cherry999",
        role: "director",
        department: "Administration",
        position: "System Administrator",
        avatar_url: "https://i.pravatar.cc/150?u=cherry"
      }
    ];

    // Создаем пользователей по одному
    for (const user of demoUsers) {
      // Проверяем, существует ли пользователь
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!existing) {
        console.log(`Creating user: ${user.email}`);
        
        // Пытаемся вставить через RPC или прямую вставку
        const { error } = await supabase
          .from('users')
          .insert(user);

        if (error) {
          console.error(`Failed to create ${user.email}:`, error);
          // Сохраняем в localStorage как fallback
          const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
          if (!existingUsers.find((u: any) => u.email === user.email)) {
            existingUsers.push(user);
            localStorage.setItem('demo_users', JSON.stringify(existingUsers));
            console.log(`Saved ${user.email} to localStorage as fallback`);
          }
        } else {
          console.log(`Successfully created ${user.email}`);
        }
      } else {
        console.log(`User ${user.email} already exists`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createDemoUsers:', error);
    return { success: false, error };
  }
};
