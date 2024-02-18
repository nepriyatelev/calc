package memory

import (
	"container/list"
	"errors"
	"sync"

	"github.com/nepriyatelev/calc/Orchestrator/internal/config"
	"github.com/nepriyatelev/calc/Orchestrator/internal/storage/postgresql/postgresql_config"
	"github.com/nepriyatelev/calc/Orchestrator/internal/tasks/arithmetic"
)

var errExpressionNotExists = errors.New("Выражение не существует")

type DataInfo struct {
	Expression *arithmetic.ASTTree
	Id         uint64
}
type Storage struct {
	data   map[string]*list.Element
	exists map[uint64]string
	queue  *list.List
	mutex  sync.Mutex
	config *config.Config
}

func New(config *config.Config) *Storage {
	return &Storage{
		data:   make(map[string]*list.Element),
		exists: make(map[uint64]string),
		queue:  list.New(),
		config: config,
	}
}

// Сохраняем выражение в память
func (s *Storage) Set(data *arithmetic.ASTTree, status string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	if data, ok := s.data[data.GetExpression()]; ok {
		dataInfo := data.Value.(DataInfo)
		data.Value = dataInfo
		return
	}
	s.config.Lock()
	s.config.MaxID++
	nextId := s.config.MaxID
	s.config.Unlock()
	// Сохраняем в базу максимальный номер
	postgresql_config.Save(s.config)
	newDataInfo := DataInfo{
		Expression: data,
		Id:         nextId,
	}
	data.SetID(nextId)
	// Запускаем вычисление выражения
	go data.Calculate()
	newElement := s.queue.PushBack(newDataInfo)
	s.data[data.GetExpression()] = newElement
	s.exists[newDataInfo.Id] = data.GetExpression()
}

// Сохраняем выражение в память из базы данных
func (s *Storage) SetFromDb(data *arithmetic.ASTTree, status string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	if data, ok := s.data[data.GetExpression()]; ok {
		dataInfo := data.Value.(DataInfo)
		if dataInfo.Expression.Value == data.Value {
			return
		}
		data.Value = data
		return
	}
	newDataInfo := DataInfo{
		Expression: data,
		Id:         data.ID,
	}
	go data.Calculate()
	newElement := s.queue.PushBack(newDataInfo)
	s.data[data.GetExpression()] = newElement
	s.exists[newDataInfo.Id] = data.GetExpression()
}

// Возвращаем выражение из памяти по строке выражения
func (s *Storage) GeByExpression(expression string) (DataInfo, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if data, ok := s.data[expression]; ok {
		return data.Value.(DataInfo), nil
	}
	return DataInfo{}, errExpressionNotExists
}

// Ищем в памяти выражение по ID
func (s *Storage) GeById(id uint64) (DataInfo, error) {
	s.mutex.Lock()
	data, ok := s.exists[id]
	s.mutex.Unlock()
	if ok {
		return s.GeByExpression(data)
	}
	return DataInfo{}, errExpressionNotExists
}
