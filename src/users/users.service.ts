import { Injectable } from '@nestjs/common'; 
import * as bcrypt from 'bcrypt'; 
import { PrismaService } from '../prisma/prisma.service.js'; 

@Injectable() export class UsersService { 
    constructor(private readonly prisma: PrismaService) {} 
    findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); } 
    async create(email: string, plainPassword: string) { const passwordHash = await bcrypt.hash(plainPassword, 10); 
        return this.prisma.user.create({ data: { email, passwordHash }, }); } 
        async updateRefreshTokenHash(userId: string, refreshToken: string | null) { const refreshTokenHash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null; 
            return this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash }, }); } }