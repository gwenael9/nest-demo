import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async findAll(includeCats?: boolean): Promise<UserEntity[]> {
    return this.userRepository.find({
      relations: includeCats ? ['cats'] : undefined,
    });
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOne(id: string, includeCats?: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: includeCats ? ['cats'] : undefined,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(userId: string, user: UpdateUserDto): Promise<UserEntity> {
    const updateResponse = await this.userRepository.update(userId, user);
    if (updateResponse.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return this.findOne(userId);
  }

  async remove(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('commentaire')
        .where('userId = :userId', { userId })
        .execute();

      const deleteResponse = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('user')
        .where('id = :userId', { userId })
        .execute();

      if (deleteResponse.affected === 0) {
        throw new NotFoundException('User not found');
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
