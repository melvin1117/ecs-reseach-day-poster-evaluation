import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(userData: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.usersRepo.create({
      name: userData.name,
      email: userData.email,
      password_hash: hashedPassword,
      role: 'organizer',
    });

    await this.usersRepo.save(newUser);
    return { message: 'User registered successfully' };
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.usersRepo.findOne({
      where: { email: credentials.email },
      select: ['id', 'name', 'email', 'password_hash', 'role'],
    });

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(
      credentials.password,
      user.password_hash,
    );

    if (!isMatch) throw new Error('Invalid credentials');

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '6h' });
    return { accessToken: token, name: user.name, email: user.email, role: user.role };
  }
}
