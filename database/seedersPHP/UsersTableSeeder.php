<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Eliminar usuarios
        User::where('name', 'Admin-Narine')->delete();
        User::where('name', 'Admin-Tico')->delete();

        $users = [
            [
                'name' => 'SuperAdmin-Edvard',
                'rol_id' => 1,
                'email' => 'info@edvardks.com',
            'password' => Hash::make('SX515wifi')
            ],
            [
                'name' => 'Admin-Narine',
                'rol_id' => 2,
                'email' => 'narine@asadorlamorenica.com',
                'password' => Hash::make('elena2019')
            ],
            [
                'name' => 'Admin-Tico',
                'rol_id' => 2,
                'email' => 'tico@asadorlamorenica.com',
                'password' => Hash::make('bmw2015')
            ],
            [
                'name' => 'Nachito',
                'rol_id' => 3,
                'email' => 'nachito@aragoneses.com',
                'password' => Hash::make('123')
            ]
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
