import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  }, 20000); // Augmentation du délai d'attente pour beforeAll

  afterAll(async () => {
    await app.close();
  });

  describe('Auth and Users', () => {
    const userDto = {
      pseudonyme: 'testuser',
      password: 'Password1!',
      name: 'Test User',
      adresse: '123 Test St',
      commentaire: 'This is a test user',
      role: 'user',
    };

    let token: string;
    let userId: number;

    it('/auth/register (POST) should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');

      token = response.body.data.access_token;
      const user = await userRepository.findOne({ where: { pseudonyme: userDto.pseudonyme } });
      userId = user.id;
    }, 20000); // Augmentation du délai d'attente pour le test

    it('/auth/login (POST) should login an existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ pseudonyme: userDto.pseudonyme, password: userDto.password })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
    }, 10000);

    it('/users/me (GET) should return the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('pseudonyme', userDto.pseudonyme);
    }, 10000);

    it('/users/me (PATCH) should update and return the current user', async () => {
      const updatedUserDto = { name: 'Updated Test User' };
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUserDto)
        .expect(200);

      expect(response.body.data).toHaveProperty('name', updatedUserDto.name);
    }, 10000);

    it('/users (GET) should return a list of users for admin', async () => {
      // First, update the user's role to admin
      await userRepository.update(userId, { role: 'admin' });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    }, 10000);

    it('/users/:id (DELETE) should delete a user by admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Utilisateur supprimé avec succès');

      const deletedUser = await userRepository.findOne({ where: { id: userId } });
      expect(deletedUser).toBeNull();
    }, 10000);
  });
});
