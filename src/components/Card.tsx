import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', onClick }) => {
  return (
    <IonCard className={className} button={!!onClick} onClick={onClick}>
      {(title || subtitle) && (
        <IonCardHeader>
          {title && <IonCardTitle>{title}</IonCardTitle>}
          {subtitle && <IonCardSubtitle>{subtitle}</IonCardSubtitle>}
        </IonCardHeader>
      )}
      <IonCardContent>
        {children}
      </IonCardContent>
    </IonCard>
  );
};

export default Card;