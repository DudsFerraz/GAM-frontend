import type { UUID } from "@/utils/global";

export type RegisterInfo = {
  email: string;
  password: string;
  displayName: string;
};

export type RegisterResponse = {
  id: UUID;
};

export type LoginInfo = {
  email: string;
  password: string;
};

export type LoginResponse = {
    token: string;
}