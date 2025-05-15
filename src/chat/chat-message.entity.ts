import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm';
//import { User } from '../user/user.entity';
import { ChatSession } from './chat-session.entity';

export type Role = 'user' | 'assistant';

@Entity()
export class ChatMessage extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
  session: ChatSession;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  structuredMessage?: Record<string, any>; // AI's actual content block

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: Role;

  @Column({ type: 'text', nullable: true })
  imageURL: string | null;
}
