import { Entity, Column, OneToMany, BaseEntity, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { ChatSession } from 'src/chat/chat-session.entity';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => ChatSession, session => session.user)
  sessions: ChatSession[];
}
