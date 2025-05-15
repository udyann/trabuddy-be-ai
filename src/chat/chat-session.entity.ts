import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => ChatMessage, message => message.session)
  messages: ChatMessage[];
}
