import React from 'react';
import { IonItem, IonAvatar, IonLabel, IonText, IonIcon } from '@ionic/react';
import { trophy, medal } from 'ionicons/icons';
import { User } from '../mockData/users';

interface RankingItemProps {
  user: User;
  position: number;
}

const RankingItem: React.FC<RankingItemProps> = ({ user, position }) => {
  const getRankIcon = (pos: number) => {
    if (pos === 1) return { icon: trophy, color: 'warning' };
    if (pos === 2) return { icon: medal, color: 'medium' };
    if (pos === 3) return { icon: medal, color: 'tertiary' };
    return null;
  };

  const rankInfo = getRankIcon(position);

  const getBeltColor = (belt: string) => {
    const colors: Record<string, string> = {
      'Branca': '#ffffff',
      'Amarela': '#ffd700',
      'Laranja': '#ff8c00',
      'Verde': '#008000',
      'Azul': '#0000ff',
      'Roxa': '#800080',
      'Marrom': '#8b4513',
      'Preta': '#000000'
    };
    return colors[belt] || '#666666';
  };

  return (
    <IonItem
      style={{
        '--padding-start': '16px',
        '--padding-end': '16px',
        '--inner-padding-end': '16px',
        borderRadius: position <= 3 ? '12px' : '8px',
        margin: position <= 3 ? '8px 0' : '4px 0',
        backgroundColor: position <= 3 ? 'rgba(56, 128, 255, 0.05)' : 'transparent'
      }}
    >
      {/* Position */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: position <= 3 ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
          color: position <= 3 ? 'white' : 'var(--ion-color-dark)',
          fontWeight: 'bold',
          fontSize: 16,
          marginRight: 12
        }}
      >
        {rankInfo ? (
          <IonIcon icon={rankInfo.icon} color={rankInfo.color} style={{ fontSize: 20 }} />
        ) : (
          position
        )}
      </div>

      {/* Avatar */}
      <IonAvatar style={{ width: 48, height: 48, marginRight: 12 }}>
        <img src={user.profilePic} alt={user.name} />
      </IonAvatar>

      {/* User Info */}
      <IonLabel style={{ flex: 1 }}>
        <IonText style={{ fontWeight: 600, fontSize: 16 }}>
          {user.name}
        </IonText>
        <p style={{ margin: '4px 0', fontSize: 14, color: 'var(--ion-color-medium)' }}>
          @{user.username}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              backgroundColor: getBeltColor(user.belt),
              color: user.belt === 'Branca' ? 'black' : 'white',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 500
            }}
          >
            {user.belt}
          </span>
        </div>
      </IonLabel>

      {/* Points */}
      <div style={{ textAlign: 'right' }}>
        <IonText style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
          {user.points.toLocaleString()}
        </IonText>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--ion-color-medium)' }}>
          pontos
        </p>
      </div>
    </IonItem>
  );
};

export default RankingItem;