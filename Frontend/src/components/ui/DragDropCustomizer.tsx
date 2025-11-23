import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from './card';
import { Badge } from './badge'
import { Button } from './button';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Map, 
  FileText, 
  Target,
  Plus,
  X
} from 'lucide-react';

interface FeatureModule {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const availableFeatures: FeatureModule[] = [
  {
    id: 'summary',
    name: '자동 요약',
    icon: FileText,
    description: '텍스트를 핵심 내용으로 요약',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'qa',
    name: '질문 응답',
    icon: MessageSquare,
    description: '내용에 대한 질문과 답변 생성',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'quiz',
    name: '퀴즈 생성',
    icon: Target,
    description: '학습 내용을 퀴즈로 변환',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'mindmap',
    name: '마인드맵',
    icon: Map,
    description: '내용을 시각적 구조로 정리',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'report',
    name: 'AI 보고서',
    icon: BookOpen,
    description: '심화 분석 보고서 생성',
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    id: 'insights',
    name: '인사이트 추출',
    icon: Brain,
    description: '숨겨진 패턴과 통찰 발견',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
];

interface DraggableFeatureProps {
  feature: FeatureModule;
  index: number;
}

const DraggableFeature: React.FC<DraggableFeatureProps> = ({ feature, index }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'feature',
    item: { feature, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const IconComponent = feature.icon;

  return (
    <div
      ref={drag}
      className={`p-4 cursor-move transition-all duration-200 hover:shadow-md rounded-lg border-2 shadow-sm ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${feature.color}`}
    >
      <div className="flex items-center space-x-3">
        <IconComponent size={20} />
        <div>
          <h4 className="font-medium">{feature.name}</h4>
          <p className="text-xs opacity-80">{feature.description}</p>
        </div>
      </div>
    </div>
  );
};

interface DroppableAreaProps {
  selectedFeatures: FeatureModule[];
  onDrop: (feature: FeatureModule) => void;
  onRemove: (featureId: string) => void;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ selectedFeatures, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'feature',
    drop: (item: { feature: FeatureModule }) => {
      onDrop(item.feature);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`min-h-96 p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isOver 
          ? 'border-primary bg-primary/5' 
          : selectedFeatures.length > 0 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg mb-2">나만의 SEEQ 워크플로우</h3>
        <p className="text-muted-foreground text-sm">
          오른쪽에서 원하는 기능을 끌어다 놓아보세요
        </p>
      </div>

      {selectedFeatures.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <div className="text-center">
            <Plus size={48} className="mx-auto mb-4 opacity-50" />
            <p>기능을 추가해 보세요</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={`${feature.id}-${index}`} className={`p-4 ${feature.color} border-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50">
                      <span className="text-sm">{index + 1}</span>
                    </div>
                    <IconComponent size={20} />
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-xs opacity-80">{feature.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(feature.id)}
                    className="h-8 w-8 p-0 hover:bg-white/20"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const DragDropCustomizer: React.FC = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureModule[]>([]);

  const handleDrop = (feature: FeatureModule) => {
    setSelectedFeatures(prev => [...prev, feature]);
  };

  const handleRemove = (featureId: string) => {
    setSelectedFeatures(prev => {
      const index = prev.findIndex(f => f.id === featureId);
      if (index > -1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  };

  const handleReset = () => {
    setSelectedFeatures([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 커스터마이징 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="px-3 py-1">
              커스터마이징 영역
            </Badge>
            {selectedFeatures.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                초기화
              </Button>
            )}
          </div>
          <DroppableArea 
            selectedFeatures={selectedFeatures}
            onDrop={handleDrop}
            onRemove={handleRemove}
          />
        </div>

        {/* 기능 모듈들 */}
        <div className="space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            사용 가능한 기능들
          </Badge>
          <div className="grid grid-cols-1 gap-3">
            {availableFeatures.map((feature, index) => (
              <DraggableFeature 
                key={feature.id} 
                feature={feature} 
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};